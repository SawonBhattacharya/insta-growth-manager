from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CreatorProfile:
    account_name: str
    niche: str
    audience: str
    goals: str
    content_style: str
    posting_capacity: str
    offers_or_products: str = ""
    inspiration_accounts: str = ""
    constraints: str = ""

    def report_title(self) -> str:
        if self.account_name.strip():
            return f"Instagram Growth Report - {self.account_name.strip()}"
        return "Instagram Growth Report"

    def to_context_markdown(self) -> str:
        return "\n".join(
            [
                "# Creator context",
                "",
                f"Account name: {self.account_name.strip() or 'Not provided'}",
                f"Niche: {self.niche.strip()}",
                f"Target audience: {self.audience.strip()}",
                f"Primary goals: {self.goals.strip()}",
                f"Current content style: {self.content_style.strip()}",
                f"Realistic posting capacity: {self.posting_capacity.strip()}",
                f"Offers, products, or business model: {self.offers_or_products.strip() or 'Not provided'}",
                f"Inspiration accounts: {self.inspiration_accounts.strip() or 'Not provided'}",
                f"Constraints: {self.constraints.strip() or 'Not provided'}",
                "",
                "Use this context to make recommendations that fit the creator's niche, audience, available time, and practical constraints.",
            ]
        )
