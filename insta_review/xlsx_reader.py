from __future__ import annotations

import re
import zipfile
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from xml.etree import ElementTree as ET

from .models import DailyMetric

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}

SHEET_TO_FIELD = {
    "views": "views",
    "reach": "reach",
    "interaction": "interactions",
    "interactions": "interactions",
    "content interactions": "interactions",
    "visit": "profile_visits",
    "visits": "profile_visits",
    "instagram profile visits": "profile_visits",
    "follow": "follows",
    "follows": "follows",
    "instagram follows": "follows",
}


def read_daily_metrics(path: str | Path) -> list[DailyMetric]:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(path)

    metrics_by_date: dict[date, dict[str, int]] = defaultdict(dict)

    with zipfile.ZipFile(path) as workbook:
        shared_strings = _read_shared_strings(workbook)
        for sheet_name, target in _read_sheet_targets(workbook):
            rows = _read_sheet_rows(workbook, target, shared_strings)
            field = _field_for_sheet(sheet_name, rows)
            if field is None:
                continue

            for row in _data_rows(rows):
                if len(row) < 2 or not row[0]:
                    continue
                metric_date = _parse_date(row[0])
                if metric_date is None:
                    continue
                metrics_by_date[metric_date][field] = _parse_int(row[1])

    return [
        DailyMetric(
            date=metric_date,
            views=values.get("views", 0),
            reach=values.get("reach", 0),
            interactions=values.get("interactions", 0),
            profile_visits=values.get("profile_visits", 0),
            follows=values.get("follows", 0),
        )
        for metric_date, values in sorted(metrics_by_date.items())
    ]


def _read_shared_strings(workbook: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in workbook.namelist():
        return []

    root = ET.fromstring(workbook.read("xl/sharedStrings.xml"))
    strings: list[str] = []
    for item in root.findall("main:si", NS):
        strings.append("".join(node.text or "" for node in item.findall(".//main:t", NS)))
    return strings


def _read_sheet_targets(workbook: zipfile.ZipFile) -> list[tuple[str, str]]:
    workbook_root = ET.fromstring(workbook.read("xl/workbook.xml"))
    rel_root = ET.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))
    rels = {
        rel.attrib["Id"]: rel.attrib["Target"].lstrip("/")
        for rel in rel_root
    }

    sheets: list[tuple[str, str]] = []
    for sheet in workbook_root.findall("main:sheets/main:sheet", NS):
        rel_id = sheet.attrib[f"{{{NS['rel']}}}id"]
        target = rels[rel_id]
        if not target.startswith("xl/"):
            target = f"xl/{target}"
        sheets.append((sheet.attrib["name"], target))
    return sheets


def _read_sheet_rows(
    workbook: zipfile.ZipFile,
    target: str,
    shared_strings: list[str],
) -> list[list[str]]:
    root = ET.fromstring(workbook.read(target))
    rows: list[list[str]] = []
    for row in root.findall("main:sheetData/main:row", NS):
        values: list[str] = []
        previous_col = 0
        for cell in row.findall("main:c", NS):
            col = _column_number(cell.attrib["r"])
            values.extend([""] * (col - previous_col - 1))
            values.append(_cell_value(cell, shared_strings))
            previous_col = col
        rows.append(values)
    return rows


def _field_for_sheet(sheet_name: str, rows: list[list[str]]) -> str | None:
    candidates = [sheet_name]
    if rows and rows[0]:
        candidates.append(rows[0][0])

    for candidate in candidates:
        normalized = candidate.strip().lower()
        if normalized in SHEET_TO_FIELD:
            return SHEET_TO_FIELD[normalized]
    return None


def _data_rows(rows: list[list[str]]) -> list[list[str]]:
    for index, row in enumerate(rows):
        lowered = [cell.strip().lower() for cell in row]
        if "date" in lowered:
            return rows[index + 1 :]
    return rows[1:]


def _cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    value = cell.find("main:v", NS)
    if value is None or value.text is None:
        return ""
    if cell.attrib.get("t") == "s":
        return shared_strings[int(value.text)]
    return value.text


def _column_number(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        return 0
    number = 0
    for char in match.group(1):
        number = number * 26 + ord(char) - 64
    return number


def _parse_date(value: str) -> date | None:
    value = value.strip()
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
    except ValueError:
        pass
    try:
        serial = float(value)
    except ValueError:
        return None
    return date.fromordinal(date(1899, 12, 30).toordinal() + int(serial))


def _parse_int(value: str) -> int:
    if value is None or str(value).strip() == "":
        return 0
    return int(float(str(value).replace(",", "")))
