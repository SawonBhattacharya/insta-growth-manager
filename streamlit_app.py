from __future__ import annotations

import os
import tempfile
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

from insta_review.creator_profile import CreatorProfile
from insta_review.prompt_templates import GENERIC_CONTENT_PROMPT, GENERIC_STRATEGY_PROMPT
from insta_review.workflow import run_custom_workflow


def _stored_groq_key() -> str:
    if os.environ.get("GROQ_API_KEY"):
        return os.environ["GROQ_API_KEY"]
    try:
        return str(st.secrets.get("GROQ_API_KEY", ""))
    except Exception:
        return ""


st.set_page_config(
    page_title="Instagram Growth Planner",
    layout="wide",
)


def main() -> None:
    st.title("Instagram Growth Planner")
    st.caption("Upload Instagram analytics, describe the creator account, and generate one client-friendly report.")

    with st.sidebar:
        st.header("Generation")
        model = st.text_input("Groq model", value=os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant"))
        groq_key = st.text_input("Groq API key", type="password", value="")
        dry_run = st.checkbox("Dashboard only", value=False, help="Skip Groq and generate only the analytics dashboard.")
        st.divider()
        st.markdown("The final download is a single HTML report with built-in PDF export buttons.")

    with st.expander("How to download and prepare your Instagram data", expanded=True):
        st.markdown(
            """
            Use Meta Business Suite to export your Instagram insights, then combine the exports into one Excel workbook before uploading.

            **Step 1: Open Meta Business Suite**

            1. Go to [business.facebook.com](https://business.facebook.com/).
            2. Log in with the Facebook or Instagram account that manages the Instagram page.
            3. Select the Instagram account you want to analyze.

            **Step 2: Download the insight files**

            1. Open **Insights** or **Analytics**.
            2. Choose the date range you want to review, such as the last 28 or 30 days.
            3. Export the daily numbers for these metrics:
               - Views
               - Reach
               - Content interactions
               - Instagram profile visits
               - Instagram follows

            **Step 3: Combine them into one Excel file**

            1. Create one `.xlsx` workbook.
            2. Add each exported metric as a separate sheet.
            3. Name the sheets clearly, for example: `Views`, `reach`, `interaction`, `visit`, and `follow`.
            4. Each sheet should have a `Date` column and a daily value column.
            5. Save the workbook, then upload it below.

            If your export uses slightly different names, keep the meaning the same. The app currently reads views, reach, interactions, profile visits, and follows.
            """
        )

    uploaded_file = st.file_uploader(
        "Upload Instagram monthly review Excel file",
        type=["xlsx"],
        help="Use the same style of workbook currently supported by the automation.",
    )

    left, right = st.columns(2)
    with left:
        account_name = st.text_input("Account name or handle", placeholder="@friend_food_page")
        niche = st.text_area(
            "What is the page about?",
            placeholder="Example: Kolkata street food reviews for budget-conscious students and young professionals.",
            height=100,
        )
        audience = st.text_area(
            "Who is the target audience?",
            placeholder="Example: People aged 18-30 in Kolkata who want affordable, reliable food recommendations.",
            height=100,
        )
        goals = st.text_area(
            "What are the main goals?",
            placeholder="Example: Grow followers, increase saves/shares, attract cafe collaborations.",
            height=100,
        )

    with right:
        content_style = st.text_area(
            "What content do they post now?",
            placeholder="Example: Reels with food closeups, price breakdowns, honest captions, and occasional vendor stories.",
            height=100,
        )
        posting_capacity = st.text_input(
            "Realistic posting capacity",
            placeholder="Example: 3 reels and 4 story days per week",
        )
        offers_or_products = st.text_area(
            "Offers, products, or business model",
            placeholder="Example: Sponsored restaurant visits, affiliate food deals, local guide PDFs.",
            height=80,
        )
        constraints = st.text_area(
            "Constraints or preferences",
            placeholder="Example: No face reveal, low budget, shoots only on weekends.",
            height=80,
        )

    inspiration_accounts = st.text_input(
        "Inspiration accounts or competitors",
        placeholder="Optional: @account1, @account2",
    )

    profile = CreatorProfile(
        account_name=account_name,
        niche=niche,
        audience=audience,
        goals=goals,
        content_style=content_style,
        posting_capacity=posting_capacity,
        offers_or_products=offers_or_products,
        inspiration_accounts=inspiration_accounts,
        constraints=constraints,
    )

    with st.expander("Preview creator context"):
        st.markdown(profile.to_context_markdown())

    can_generate = uploaded_file is not None and niche.strip() and audience.strip() and goals.strip() and content_style.strip()
    if not can_generate:
        st.info("Upload the Excel file and fill the core creator details to generate a report.")

    if st.button("Generate report", type="primary", disabled=not can_generate):
        if groq_key:
            os.environ["GROQ_API_KEY"] = groq_key
        elif _stored_groq_key():
            os.environ["GROQ_API_KEY"] = _stored_groq_key()

        if not dry_run and not os.environ.get("GROQ_API_KEY"):
            st.error("Add a Groq API key in the sidebar, or enable Dashboard only.")
            return

        with st.status("Generating report...", expanded=True) as status:
            st.write("Reading Excel file and calculating KPIs.")
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                workbook_path = temp_path / uploaded_file.name
                workbook_path.write_bytes(uploaded_file.getvalue())

                output_dir = temp_path / "outputs"
                st.write("Building strategy and content plan." if not dry_run else "Building dashboard.")
                run_custom_workflow(
                    excel_path=workbook_path,
                    niche_context=profile.to_context_markdown(),
                    strategist_prompt=GENERIC_STRATEGY_PROMPT,
                    content_prompt=GENERIC_CONTENT_PROMPT,
                    out_dir=output_dir,
                    dry_run=dry_run,
                    model=model,
                    report_title=profile.report_title(),
                )

                report_html = (output_dir / "report.html").read_text(encoding="utf-8")

            status.update(label="Report ready", state="complete")

        st.success("Your report is ready.")
        st.download_button(
            "Download report.html",
            data=report_html,
            file_name="instagram-growth-report.html",
            mime="text/html",
        )
        components.html(report_html, height=900, scrolling=True)


if __name__ == "__main__":
    main()
