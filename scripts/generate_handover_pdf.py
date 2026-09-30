import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress running header/footer on cover page
            return
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#92400e")) # Cask amber
        self.drawString(48, 804, "BRIGHTON REAL ALE SOCIETY")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#71717a"))
        self.drawString(185, 804, "• Executive Handover & Website Guide")
        self.drawRightString(547, 804, "WIP Edition • Sept 2026")
        
        # Header rule
        self.setStrokeColor(colors.HexColor("#fde68a"))
        self.setLineWidth(0.8)
        self.line(48, 796, 547, 796)
        
        # Footer rule
        self.setStrokeColor(colors.HexColor("#e4e4e7"))
        self.setLineWidth(0.5)
        self.line(48, 44, 547, 44)
        
        # Footer text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#71717a"))
        self.drawString(48, 32, "Confidential — Committee Use Only • www.brightonale.co.uk")
        self.drawRightString(547, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename="BRAS_Executive_Handover_and_Website_Guide.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=48,
        rightMargin=48,
        topMargin=54,
        bottomMargin=54
    )
    
    # Palette
    C_AMBER = colors.HexColor("#c27803")       # Primary accent gold
    C_AMBER_DARK = colors.HexColor("#92400e")  # Deep gold
    C_AMBER_LIGHT = colors.HexColor("#fffbeb") # Warm cream
    C_SLATE = colors.HexColor("#1e293b")       # Dark charcoal heading
    C_BODY = colors.HexColor("#334155")        # Body text
    C_MUTED = colors.HexColor("#64748b")       # Muted subtext
    C_BORDER = colors.HexColor("#e2e8f0")      # Neutral border
    C_GREEN = colors.HexColor("#15803d")       # Success green
    C_CARD_BG = colors.HexColor("#f8fafc")     # Section card background
    
    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    style_cover_super = ParagraphStyle(
        'CoverSuper',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=C_AMBER_DARK,
        alignment=TA_CENTER,
        spaceAfter=6
    )
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=C_SLATE,
        alignment=TA_CENTER,
        spaceAfter=10
    )
    style_cover_sub = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=C_MUTED,
        alignment=TA_CENTER,
        spaceAfter=18
    )
    style_h1 = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=C_SLATE,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    style_h2 = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=C_AMBER_DARK,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    style_h3 = ParagraphStyle(
        'Header3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=C_SLATE,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )
    style_body = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=C_BODY,
        spaceAfter=5
    )
    style_body_bold = ParagraphStyle(
        'BodyDarkBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=C_SLATE,
        spaceAfter=5
    )
    style_bullet = ParagraphStyle(
        'BulletDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=C_BODY,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )
    style_callout_title = ParagraphStyle(
        'CalloutTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=C_AMBER_DARK,
        spaceAfter=3
    )
    style_callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=C_BODY
    )
    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=TA_CENTER
    )
    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=C_BODY
    )
    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=C_SLATE
    )

    story = []
    
    # ----------------------------------------------------
    # COVER PAGE
    # ----------------------------------------------------
    story.append(Spacer(1, 10))
    logo_path = 'public/assets/bras-logo-pint.png'
    if os.path.exists(logo_path):
        story.append(RLImage(logo_path, width=80, height=80))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("BRIGHTON REAL ALE SOCIETY", style_cover_super))
    story.append(Paragraph("Executive Handover &amp; Website Operations Guide", style_cover_title))
    story.append(Paragraph("A Comprehensive Manual for Live Pub Socials, Digital Scoring, and Society Administration", style_cover_sub))
    
    # WIP Notice Box
    wip_html = (
        "<b>OFFICIAL NOTICE — WORK IN PROGRESS (WIP) EDITION:</b><br/>"
        "This handbook represents the complete live operational standard for the Brighton Real Ale Society web platform "
        "(<code>https://www.brightonale.co.uk</code>). The system is fully operational for live socials, voting, leaderboard "
        "tracking, and administrative controls. While minor visual polish, seasonal archives, and additional features remain under "
        "active development, all procedures documented herein reflect active, production-ready capabilities."
    )
    wip_table = Table([[Paragraph(wip_html, style_callout_text)]], colWidths=[499])
    wip_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef3c7")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#f59e0b")),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
    ]))
    story.append(wip_table)
    story.append(Spacer(1, 14))
    
    # Executive Metadata Block
    meta_data = [
        [
            Paragraph("<b>Target Audience:</b>", style_body_bold),
            Paragraph("<b>Takara Webster</b> (Society President)<br/><b>Harrison Emrys-Jones</b> (Finance Director)", style_body)
        ],
        [
            Paragraph("<b>Prepared By:</b>", style_body_bold),
            Paragraph("<b>Harry Rogers</b> (VP &amp; IT Officer, 2025–2026)<br/><b>Max Emery</b> (Socials &amp; Media Officer, 2024–2026)", style_body)
        ],
        [
            Paragraph("<b>Outgoing &amp; Founding Officers:</b>", style_body_bold),
            Paragraph("<b>Albie Gullis</b> (President, 2025–2026)<br/><b>James Graham</b> (Founding President, 2023–2025)", style_body)
        ],
        [
            Paragraph("<b>Active Executive Roster:</b>", style_body_bold),
            Paragraph("<b>Rico Chadwick Gugolz</b> (VP Social, 2026–Present)", style_body)
        ],
        [
            Paragraph("<b>Date of Issue:</b>", style_body_bold),
            Paragraph("September 2026 • Term 2026/2027", style_body)
        ],
        [
            Paragraph("<b>Platform &amp; Domain:</b>", style_body_bold),
            Paragraph("<code>https://www.brightonale.co.uk</code> (Vercel Edge / Next.js 16 / Supabase)", style_body)
        ],
    ]
    meta_table = Table(meta_data, colWidths=[140, 359])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_CARD_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))
    
    # Executive Portraits Row (Takara & Harrison)
    takara_card = 'public/images/committee/takara.png'
    harrison_card = 'public/images/committee/harrison.png'
    if os.path.exists(takara_card) and os.path.exists(harrison_card):
        img_row = [
            [
                RLImage(takara_card, width=130, height=130),
                RLImage(harrison_card, width=130, height=130)
            ],
            [
                Paragraph("<b>Takara Webster</b><br/>Society President", style_body_bold),
                Paragraph("<b>Harrison Emrys-Jones</b><br/>Finance Director", style_body_bold)
            ]
        ]
        img_table = Table(img_row, colWidths=[249, 250])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 4),
            ('TOPPADDING', (0, 1), (-1, 1), 2),
        ]))
        story.append(img_table)
    
    story.append(PageBreak())
    
    # ----------------------------------------------------
    # SECTION 1: EXECUTIVE WELCOME & TRANSITION CHARTER
    # ----------------------------------------------------
    story.append(Paragraph("1. Executive Welcome &amp; Transition Charter", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_AMBER, spaceAfter=8))
    
    story.append(Paragraph(
        "Welcome, Takara and Harrison! As the incoming executive leadership of the Brighton Real Ale Society for "
        "the 2026/2027 term and beyond, you inherit a rich, vibrant tradition spanning four years of cask ale exploration, "
        "over 800 member ratings, and deep ties with Brighton's historic pubs.",
        style_body
    ))
    story.append(Paragraph(
        "This platform is custom-built to support your weekly socials, eliminate friction for members, and maintain an "
        "accurate historical archive that publicans and tasters take pride in. Everything is designed to be easily operated from "
        "a smartphone right at the pub table.",
        style_body
    ))
    
    story.append(Paragraph("Executive Division of Responsibilities", style_h2))
    roles_data = [
        [
            Paragraph("Role", style_table_header),
            Paragraph("Officer", style_table_header),
            Paragraph("Primary Responsibilities &amp; Website Duties", style_table_header)
        ],
        [
            Paragraph("<b>President</b>", style_table_cell_bold),
            Paragraph("Takara Webster", style_table_cell),
            Paragraph(
                "• Overall society leadership and pub liaison.<br/>"
                "• Selection of weekly host pubs and liaison with cellar managers.<br/>"
                "• Chairing committee meetings and sanctioning official society announcements.<br/>"
                "• Activating the official pint of the night in <code>/committee</code>.",
                style_table_cell
            )
        ],
        [
            Paragraph("<b>Finance Director</b>", style_table_cell_bold),
            Paragraph("Harrison Emrys-Jones", style_table_cell),
            Paragraph(
                "• Society bank account management and treasury tracking.<br/>"
                "• Monitoring membership subscriptions and pub expenditure receipts.<br/>"
                "• Exporting the Member Matrix CSV for financial and attendance auditing.<br/>"
                "• Oversight of annual awards trophies and merchandise budgets.",
                style_table_cell
            )
        ],
        [
            Paragraph("<b>VP Social</b>", style_table_cell_bold),
            Paragraph("Rico Chadwick Gugolz", style_table_cell),
            Paragraph(
                "• Social schedule promotion and attendee engagement.<br/>"
                "• Encouraging member turnout and ensuring all attendees submit their live scores.<br/>"
                "• Social photography and Instagram recap curation.",
                style_table_cell
            )
        ],
        [
            Paragraph("<b>IT &amp; Systems (Advisory)</b>", style_table_cell_bold),
            Paragraph("Harry Rogers", style_table_cell),
            Paragraph(
                "• Technical stewardship, Supabase PostgreSQL database maintenance, and code builds.<br/>"
                "• Domain DNS (<code>brightonale.co.uk</code>) and Next.js hosting.",
                style_table_cell
            )
        ],
    ]
    roles_table = Table(roles_data, colWidths=[90, 95, 314])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_SLATE),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, C_CARD_BG]),
    ]))
    story.append(roles_table)
    story.append(Spacer(1, 10))
    
    # ----------------------------------------------------
    # SECTION 2: SOCIETY PHILOSOPHY & CAMRA SCORING
    # ----------------------------------------------------
    story.append(Paragraph("2. Society Philosophy &amp; CAMRA Alignment", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_AMBER, spaceAfter=8))
    
    story.append(Paragraph(
        "The Brighton Real Ale Society stands in active alignment with the <b>Campaign for Real Ale (CAMRA)</b>, "
        "the world's foremost consumer campaign founded in 1971. Every rating entered into our platform is an evaluation "
        "of traditional cask-conditioned ale.",
        style_body
    ))
    
    story.append(Paragraph("The Three Pillars of Cask Conditioned Beer", style_h2))
    story.append(Paragraph("<b>1. Living Yeast:</b> Secondary fermentation occurs naturally inside the cask in the pub cellar, evolving flavour and mouthfeel.", style_bullet))
    story.append(Paragraph("<b>2. Unpasteurized &amp; Unfiltered:</b> Crucial hop oils and delicate malt profiles are preserved entirely without thermal damage.", style_bullet))
    story.append(Paragraph("<b>3. Natural Carbonation:</b> Served without extraneous gas cylinders (CO2 or nitrogen); gentle, natural effervescence.", style_bullet))
    story.append(Spacer(1, 6))
    
    story.append(Paragraph("The National Beer Scoring System (NBSS) Calibration", style_h2))
    story.append(Paragraph(
        "To ensure objectivity across all tasters, our 10.0-point scoring scale is formally calibrated against CAMRA's "
        "established 0 to 5 condition scale:",
        style_body
    ))
    
    camra_data = [
        [
            Paragraph("CAMRA NBSS", style_table_header),
            Paragraph("Condition Descriptor", style_table_header),
            Paragraph("BRAS Scale", style_table_header),
            Paragraph("Tasting Assessment Criteria", style_table_header)
        ],
        [
            Paragraph("<b>5.0</b>", style_table_cell_bold),
            Paragraph("<b>Perfect</b>", style_table_cell_bold),
            Paragraph("<font color='#15803d'><b>8.5 – 10.0★</b></font>", style_table_cell),
            Paragraph("Sublime cask condition. Peak clarity, ideal cellar temperature (11-13°C), vibrant aroma, immaculate carbonation. Zero faults.", style_table_cell)
        ],
        [
            Paragraph("<b>4.0</b>", style_table_cell_bold),
            Paragraph("<b>Very Good</b>", style_table_cell_bold),
            Paragraph("<font color='#16a34a'><b>7.0 – 8.4★</b></font>", style_table_cell),
            Paragraph("Excellent pint. Served fresh, well-conditioned, clean head retention, true to brewery style.", style_table_cell)
        ],
        [
            Paragraph("<b>3.0</b>", style_table_cell_bold),
            Paragraph("<b>Good</b>", style_table_cell_bold),
            Paragraph("<font color='#ca8a04'><b>6.0 – 6.9★</b></font>", style_table_cell),
            Paragraph("Sound commercial standard. Completely enjoyable, satisfactory temperature and mouthfeel, minor loss of aroma.", style_table_cell)
        ],
        [
            Paragraph("<b>2.0</b>", style_table_cell_bold),
            Paragraph("<b>Average</b>", style_table_cell_bold),
            Paragraph("<font color='#d97706'><b>4.5 – 5.9★</b></font>", style_table_cell),
            Paragraph("Drinkable but unimpressive. Lacks vitality, slightly warm or flat, muted hop presence.", style_table_cell)
        ],
        [
            Paragraph("<b>1.0</b>", style_table_cell_bold),
            Paragraph("<b>Poor</b>", style_table_cell_bold),
            Paragraph("<font color='#dc2626'><b>3.0 – 4.4★</b></font>", style_table_cell),
            Paragraph("Definite cellar faults. Stale, unpleasantly warm, souring, hazy without reason, or oxidized.", style_table_cell)
        ],
        [
            Paragraph("<b>0.0</b>", style_table_cell_bold),
            Paragraph("<b>Undrinkable</b>", style_table_cell_bold),
            Paragraph("<font color='#991b1b'><b>1.0 – 2.9★</b></font>", style_table_cell),
            Paragraph("Vinegar, infected, returned to the bar immediately.", style_table_cell)
        ],
    ]
    camra_table = Table(camra_data, colWidths=[65, 80, 80, 274])
    camra_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_AMBER_DARK),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, C_CARD_BG]),
    ]))
    story.append(camra_table)
    story.append(Spacer(1, 8))
    
    # Official Infographic reference
    guide_img = 'public/images/camra-beer-scoring-guide.png'
    if os.path.exists(guide_img):
        story.append(Paragraph("Official CAMRA National Beer Scoring Guide", style_h3))
        # 1024x723 original -> 450x317 scaled
        story.append(RLImage(guide_img, width=450, height=317))
        story.append(Paragraph(
            "<font size='7' color='#64748b'>Official graphic &copy; Campaign for Real Ale (CAMRA). Reproduced for educational and scoring calibration purposes. Visit <code>https://camra.org.uk/beer-and-pubs/beer/beer-scoring/</code>.</font>",
            style_body
        ))
    
    story.append(PageBreak())
    
    # ----------------------------------------------------
    # SECTION 3: LIVE PUB SOCIAL SCORING (/rate)
    # ----------------------------------------------------
    story.append(Paragraph("3. Live Social Scoring Workflow (/rate)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_AMBER, spaceAfter=8))
    
    story.append(Paragraph(
        "The live rating page is the lifeblood of our weekly socials. We intentionally removed passwords for voters: "
        "any attendee who scans the QR code or opens <code>https://www.brightonale.co.uk/rate</code> can score within 5 seconds.",
        style_body
    ))
    
    story.append(Paragraph("How Attendee Scoring Operates", style_h2))
    story.append(Paragraph("<b>Step 1: Arrive &amp; Open Rate Page.</b> Attendees open <code>/rate</code> on their smartphone browser.", style_bullet))
    story.append(Paragraph("<b>Step 2: Enter Name.</b> On their first social, the member types their name (e.g. <i>Takara W.</i>). The site permanently stores this in local cookies so they never have to type it again.", style_bullet))
    story.append(Paragraph("<b>Step 3: Select Rating.</b> Quick buttons allow one-tap selection (5.0, 6.0, 7.0, 7.5, 8.0, 8.5, 9.0), or the slider allows precise decimal scores (e.g. 8.25★).", style_bullet))
    story.append(Paragraph("<b>Step 4: Tap Submit Rating.</b> Instant submission records the score to the database and displays a green confirmation message.", style_bullet))
    story.append(Spacer(1, 6))
    
    # Key Rules Callout
    rate_rules = (
        "<b>CRITICAL VOTING FEATURES &amp; SAFEGUARDS:</b><br/>"
        "• <b>In-Place Deduplication:</b> If an attendee re-rates the same pint (e.g. they decide a pint warmed up or improved), "
        "their previous score is smoothly updated in place. It will NEVER create duplicate rows or distort the society average.<br/>"
        "• <b>Returning Voter Recognition:</b> Returning members are immediately greeted with their name and their existing vote if cast.<br/>"
        "• <b>Idle State Protection:</b> If the committee has not set an active pint, the page displays a polite 'No Active Pint Set' notice, "
        "preventing erroneous scores from being submitted out-of-round."
    )
    r_table = Table([[Paragraph(rate_rules, style_callout_text)]], colWidths=[499])
    r_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
        ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor("#22c55e")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(r_table)
    story.append(Spacer(1, 10))
    
    if os.path.exists('scripts/screenshots/rate_page_clean.png'):
        story.append(RLImage('scripts/screenshots/rate_page_clean.png', width=450, height=689.0625))
        story.append(Spacer(1, 10))
    
    # ----------------------------------------------------
    # SECTION 4: THE COMMITTEE COMMAND CENTER (/committee)
    # ----------------------------------------------------
    story.append(Paragraph("4. The Committee Command Center (/committee)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_AMBER, spaceAfter=8))
    
    story.append(Paragraph(
        "The committee dashboard at <code>/committee</code> is your administrative headquarters. From here, Takara or Harrison "
        "can start a round, monitor incoming votes live, remove bad entries, manage historical events, and configure site features.",
        style_body
    ))
    
    story.append(Paragraph("Standard Pub Night Operational Checklist", style_h2))
    
    flow_data = [
        [
            Paragraph("Phase", style_table_header),
            Paragraph("Action", style_table_header),
            Paragraph("Dashboard Control / Procedure", style_table_header)
        ],
        [
            Paragraph("<b>1. Arrival</b>", style_table_cell_bold),
            Paragraph("Sign in as Committee", style_table_cell),
            Paragraph("Navigate to <code>/committee</code>. Log in with the committee account credentials. Session persists via secure cookie.", style_table_cell)
        ],
        [
            Paragraph("<b>2. Round Start</b>", style_table_cell_bold),
            Paragraph("Activate Tonight's Pint", style_table_cell),
            Paragraph("Under <b>'Active Pint for Scoring'</b>, select the Pub (e.g. <i>The Hole in the Wall</i>), enter the Cask Ale (e.g. <i>Harvey's Sussex Best</i>), Brewery, and confirm the date. Tap <b>'Activate Pint for Scoring'</b>.", style_table_cell)
        ],
        [
            Paragraph("<b>3. In-Social</b>", style_table_cell_bold),
            Paragraph("Monitor Live Voting", style_table_cell),
            Paragraph("Watch the <b>'Active Pint Live Votes'</b> monitor. Inspect real-time vote count, running average score, and each attendee's submitted rating. The counter refreshes automatically.", style_table_cell)
        ],
        [
            Paragraph("<b>4. Moderation</b>", style_table_cell_bold),
            Paragraph("Discard Erroneous Votes", style_table_cell),
            Paragraph("If someone accidentally submits a typo (e.g. a joke 1.0 or test vote), tap <b>'Remove'</b> next to their vote. <i>Note: This is strictly scoped to the active social; historical archives are completely safe.</i>", style_table_cell)
        ],
        [
            Paragraph("<b>5. Wrap-Up</b>", style_table_cell_bold),
            Paragraph("Conclude Scoring", style_table_cell),
            Paragraph("When leaving the pub, tap <b>'Stop Scoring'</b>. The social and its final average score are immediately locked and permanently committed to the Society Matrix &amp; Leaderboards.", style_table_cell)
        ],
    ]
    flow_table = Table(flow_data, colWidths=[70, 105, 324])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_SLATE),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, C_CARD_BG]),
    ]))
    story.append(flow_table)
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Additional Committee Controls", style_h2))
    story.append(Paragraph("• <b>Add Past Socials:</b> Use the 'Add Past Social / Historical Event' card to log past pub visits, photos, and ratings.", style_bullet))
    story.append(Paragraph("• <b>Feature Toggles:</b> Instantly enable or disable public visibility of Leaderboard, Matrix, Wordle, Awards, or Gallery with one tap.", style_bullet))
    story.append(Paragraph("• <b>Daily Ale Wordle:</b> Set the daily 5-letter brewing or ale word and hint for member entertainment.", style_bullet))
    story.append(Paragraph("• <b>Photo Gallery:</b> Upload and categorize photos from past pub crawls into dedicated social albums.", style_bullet))
    
    story.append(PageBreak())
    
    # ----------------------------------------------------
    # SECTION 5: INTELLIGENCE & DATA (Matrix, Leaderboard, History)
    # ----------------------------------------------------
    story.append(Paragraph("5. Intelligence &amp; Data Archives", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_AMBER, spaceAfter=8))
    
    story.append(Paragraph(
        "BRAS maintains one of the most comprehensive student real ale databases in the UK. Understanding where this data "
        "lives and how to extract it is essential for society reporting.",
        style_body
    ))
    
    story.append(Paragraph("The Member × Pub Matrix (/matrix)", style_h2))
    story.append(Paragraph(
        "The Matrix tabulates every single pint rating submitted by BRAS inspectors across every pub visited since 2023. "
        "It features live search by member name or pub, color-coded score cells (green for sublime, yellow for solid, orange/red for poor), "
        "and individual inspector analytics (most generous taster, harshest critic, attendance counts).",
        style_body
    ))
    story.append(Paragraph(
        "<b>Exporting CSVs for Harrison:</b> At the top right of the matrix page, tap <b>'Export CSV'</b>. This generates a complete, "
        "spreadsheet-compatible <code>.csv</code> file containing every member's attendance and score. Harrison can open this directly "
        "in Microsoft Excel or Google Sheets for attendance tracking, term reports, and dues verification.",
        style_body
    ))
    
    story.append(Paragraph("Society Leaderboards (/leaderboard)", style_h2))
    story.append(Paragraph(
        "Displays real-time rankings across three categories: "
        "<b>Top Rated Ales</b> (highest average pint scores), <b>Top Ranked Pubs</b> (best kept cellars), and "
        "<b>Top Brewers</b> (Sussex &amp; UK independent breweries). Minimum rating thresholds prevent single-vote anomalies.",
        style_body
    ))
    
    story.append(Paragraph("Society History &amp; Directory (/history)", style_h2))
    story.append(Paragraph(
        "Chronological timeline of every Instagram post and official social recap from our inaugural meeting at The Hole in the Wall "
        "in 2023 to the present day. Includes the official Committee Directory cards on the heritage tavern background.",
        style_body
    ))
    story.append(Spacer(1, 6))
    
    # Founding President Portrait in History
    james_card = 'public/images/committee/james-graham.png'
    if os.path.exists(james_card):
        j_data = [
            [
                RLImage(james_card, width=120, height=120),
                Paragraph(
                    "<b>Founding Legacy: James Graham</b><br/>"
                    "Founding President (2023–2025). James established the society's culture of camaraderie, cellar appreciation, "
                    "and objective scoring that Takara and Harrison now steward into the 2026/2027 term. "
                    "The new official portrait card is now permanently archived in the digital directory.",
                    style_body
                )
            ]
        ]
        j_table = Table(j_data, colWidths=[130, 369])
        j_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), C_CARD_BG),
            ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(j_table)
    
    story.append(PageBreak())
    
    # ----------------------------------------------------
    # SECTION 6: EXECUTIVE & FINANCIAL PROTOCOLS
    # ----------------------------------------------------
    story.append(Paragraph("6. Executive &amp; Financial Protocols", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_AMBER, spaceAfter=8))
    
    story.append(Paragraph("Special Guidance for Takara Webster (President)", style_h2))
    story.append(Paragraph("• <b>Host Pub Protocol:</b> Ensure the cellar manager or licensee knows BRAS is visiting. Many independent pubs offer real ale discounts or cellar tours for society members.", style_bullet))
    story.append(Paragraph("• <b>Opening the Social:</b> At the start of the night, announce the official pint of the round and remind everyone to open <code>brightonale.co.uk/rate</code>.", style_bullet))
    story.append(Paragraph("• <b>New Member Welcomes:</b> Make sure newcomers pair up with a committee member to learn the CAMRA scoring standard.", style_bullet))
    story.append(Paragraph("• <b>Constitutional Custody:</b> Coordinate committee election schedules and AGM recaps at the conclusion of the academic year.", style_bullet))
    
    story.append(Spacer(1, 6))
    story.append(Paragraph("Special Guidance for Harrison Emrys-Jones (Finance Director)", style_h2))
    story.append(Paragraph("• <b>Membership Dues:</b> Cross-reference newly registered voter names on the Matrix with paid society subscriptions.", style_bullet))
    story.append(Paragraph("• <b>Pub Spend Records:</b> Keep receipts for any subsidized rounds, society tab contributions, or awards purchases.", style_bullet))
    story.append(Paragraph("• <b>Quarterly Audit:</b> Use the Matrix CSV export to audit turnouts and provide an annual financial statement.", style_bullet))
    story.append(Paragraph("• <b>Annual Awards Budget:</b> Allocate funds in Term 2 for the official engraved pint glasses and tankards presented at the Annual Awards Social.", style_bullet))
    
    story.append(Spacer(1, 8))
    # ----------------------------------------------------
    # SECTION 7: TECHNICAL & MAINTENANCE QUICK REFERENCE
    # ----------------------------------------------------
    story.append(Paragraph("7. Technical &amp; Maintenance Quick Reference", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_AMBER, spaceAfter=8))
    
    story.append(Paragraph(
        "For Harry and any future technical stewards, here is the essential cheat-sheet for managing the codebase, "
        "database, and deployments:",
        style_body
    ))
    
    tech_data = [
        [
            Paragraph("Item / Task", style_table_header),
            Paragraph("Standard Procedure &amp; Command Line", style_table_header)
        ],
        [
            Paragraph("<b>Repository</b>", style_table_cell_bold),
            Paragraph("GitHub: <code>https://github.com/brightonale/bras-website.git</code> (Branch: <code>main</code>)", style_table_cell)
        ],
        [
            Paragraph("<b>Production Build</b>", style_table_cell_bold),
            Paragraph("<b>MANDATORY FLAG:</b> Always run <code>npx next build --webpack</code>. Never run without <code>--webpack</code>.", style_table_cell)
        ],
        [
            Paragraph("<b>Development Server</b>", style_table_cell_bold),
            Paragraph("Run <code>npm run dev</code>. Server starts on <code>http://localhost:3000</code>.", style_table_cell)
        ],
        [
            Paragraph("<b>Database Migrations</b>", style_table_cell_bold),
            Paragraph("PostgreSQL on Supabase. Run <code>npx prisma db push</code> to sync schema changes. Connection pooler uses PgBouncer on port 6543.", style_table_cell)
        ],
        [
            Paragraph("<b>Domain &amp; DNS</b>", style_table_cell_bold),
            Paragraph("Primary: <code>https://www.brightonale.co.uk</code> (Redirect: <code>brightonale.co.uk</code>). Hosted on Vercel Edge.", style_table_cell)
        ],
        [
            Paragraph("<b>Portrait Generation</b>", style_table_cell_bold),
            Paragraph("Run <code>python scripts/enhance-and-composite-all.py</code> to regenerate committee portrait cards on <code>bg_heritage_tavern</code>.", style_table_cell)
        ],
    ]
    tech_table = Table(tech_data, colWidths=[120, 379])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), C_SLATE),
        ('GRID', (0, 0), (-1, -1), 0.5, C_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, C_CARD_BG]),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))
    
    # Final Sign-off Box
    signoff = (
        "<b>A FINAL NOTE FROM THE OUTGOING COMMITTEE:</b><br/>"
        "To Takara, Harrison, and Rico: The society is in tremendous hands. Treat every publican with warmth, "
        "demand excellence in the glass, never settle for flat keg lager, and keep Brighton's cask heritage thriving. "
        "Cheers to a fantastic 2026/2027 term!"
    )
    s_table = Table([[Paragraph(signoff, style_callout_text)]], colWidths=[499])
    s_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), C_AMBER_LIGHT),
        ('BORDER', (0, 0), (-1, -1), 1, C_AMBER),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(s_table)
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Handover PDF successfully compiled: {pdf_path}")
    return pdf_path

if __name__ == '__main__':
    out_pdf = build_pdf()
    print("Done! File size:", os.path.getsize(out_pdf), "bytes")
