import { NextResponse } from 'next/server';
import { allSchemes } from '@/lib/schemes-data';

// Highly-specialized procedural blueprints and facts for all categories
const CATEGORY_BLUEPRINTS: Record<string, {
  website: string;
  helpline: string;
  eligibility: string[];
  documents: { name: string; description: string; howToGet: string; alternatives: string }[];
  steps: { title: string; description: string; subSteps: string[]; tips: string[]; warnings: string[]; time: string; mode: string }[];
  mistakes: string[];
  rejection: string;
  complaint: string;
  faqs: { question: string; answer: string }[];
}> = {
  identity: {
    website: 'https://uidai.gov.in',
    helpline: '1947 (UIDAI Toll-Free)',
    eligibility: [
      'Must be a resident citizen of India.',
      'No minimum age limit (Bal Aadhaar is available for children under 5 years).',
      'Requires verified biometrics (for applicants aged 5 years or older).'
    ],
    documents: [
      { name: 'Proof of Identity (POI)', description: 'Official document containing name and photograph', howToGet: 'Use PAN Card, Passport, or Voter ID.', alternatives: 'Driving License, Government ID card' },
      { name: 'Proof of Address (POA)', description: 'Document verifying residential location', howToGet: 'Get Utility bill, bank passbook, or rent agreement.', alternatives: 'Post office passbook, Aadhaar Letter' },
      { name: 'Proof of Date of Birth (DOB)', description: 'Verified DOB evidence', howToGet: 'Obtain Birth Certificate or 10th standard mark sheet.', alternatives: 'PAN Card, Passport' }
    ],
    steps: [
      { title: 'Locate Enrollment Center', description: 'Find the nearest authorized UIDAI Seva Kendra online.', subSteps: ['Go to uidai.gov.in portal.', 'Search by PIN code or State.', 'Book an appointment to save time.'], tips: ['Always carry original documents for verification.', 'Check center timing in advance.'], warnings: ['Avoid unauthorized agents charging extra fees.'], time: '1-2 hours', mode: 'offline' },
      { title: 'Submit Biometrics and Photos', description: 'Provide fingerprint scans, iris scans, and a physical photograph.', subSteps: ['Verify data entry on the operator screen.', 'Complete iris capture.', 'Complete ten-fingerprint scan.'], tips: ['Ensure camera lens is clean during capture.', 'Confirm details are spelled correctly on screen.'], warnings: ['Do not apply multiple times to avoid duplication rejection.'], time: '30 mins', mode: 'offline' },
      { title: 'Acknowledge and Track', description: 'Collect your 14-digit Enrolment ID slip.', subSteps: ['Store the slip securely.', 'Check status online after 7 days.'], tips: ['Take a photo of the slip as backup.'], warnings: ['Do not lose the acknowledgment slip before card arrival.'], time: '10 mins', mode: 'online' }
    ],
    mistakes: ['Mismatched names between documents.', 'Blurry document uploads.', 'Applying repeatedly causing duplicate blocks.'],
    rejection: 'If rejected, check the rejection reason on the UIDAI portal using your Enrolment ID. Most rejections are due to biometric blur or data mismatch, which can be resolved by booking a correction appointment.',
    complaint: 'File a complaint online via UIDAI portal contact forms or call 1947.',
    faqs: [
      { question: 'Is Bal Aadhaar mandatory to update?', answer: 'Yes, biometrics must be updated when the child reaches age 5 and again at age 15.' },
      { question: 'How long does physical delivery take?', answer: 'It usually takes 30 to 90 days, but e-Aadhaar can be downloaded instantly online.' }
    ]
  },
  passport: {
    website: 'https://passportindia.gov.in',
    helpline: '1800-258-1800 (National Call Center)',
    eligibility: [
      'Must be an Indian citizen.',
      'No active criminal cases or outstanding court warrants.',
      'Possess verified proof of address and date of birth.'
    ],
    documents: [
      { name: 'Proof of Present Address', description: 'Verification of your current residential location', howToGet: 'Water/electricity bill, bank statement, or Aadhaar Card.', alternatives: 'Rent agreement, employer certificate' },
      { name: 'Proof of Date of Birth', description: 'Official record of DOB', howToGet: 'Birth Certificate or 10th standard passing certificate.', alternatives: 'PAN Card, Aadhaar Card' },
      { name: 'Non-ECR Category Evidence', description: 'Proof of educational qualification (10th standard or higher)', howToGet: 'Provide your matriculation or higher degree certificate.', alternatives: 'Tax payer documents' }
    ],
    steps: [
      { title: 'Online Registration', description: 'Register on the official Passport Seva online portal.', subSteps: ['Create login credentials.', 'Select "Apply for Fresh Passport".', 'Fill out the web form carefully.'], tips: ['Spelling of name must exactly match your matriculation certificate.'], warnings: ['Only use the official .gov.in domain to avoid scam sites.'], time: '1 hour', mode: 'online' },
      { title: 'Payment and Booking', description: 'Pay the processing fee and book an appointment slot.', subSteps: ['Pay ₹1500 online using NetBanking/UPI.', 'Select your nearest PSK/POPSK center.', 'Schedule available date and time.'], tips: ['Print the application receipt containing the ARN.'], warnings: ['Missed appointments can only be rescheduled twice within 1 year.'], time: '15 mins', mode: 'online' },
      { title: 'PSK Visit', description: 'Visit the Passport Seva Kendra for document verification.', subSteps: ['Go through token counters.', 'Undergo biometric scan and document upload.', 'Meet the granting officer.'], tips: ['Arrive 15 minutes before your slot.', 'Carry all original documents + 1 set of self-attested copies.'], warnings: ['Incomplete documents will result in application deferral.'], time: '2-3 hours', mode: 'offline' },
      { title: 'Police Verification', description: 'Local police officer visits your address to verify details.', subSteps: ['Police schedules visit.', 'Present neighbor references.', 'Sign the verification report.'], tips: ['Keep neighborhood witnesses informed.'], warnings: ['Do not pay speed-money to the verification officer.'], time: '7-14 days', mode: 'offline' }
    ],
    mistakes: ['Address spelling mismatches.', 'Not uploading Non-ECR documents.', 'Missing appointments without rescheduling.'],
    rejection: 'Passport applications are rarely outright rejected unless criminal records are found. They are usually deferred due to address verification failure. Visit your regional passport office (RPO) with fresh address proofs to unblock.',
    complaint: 'Contact the feedback desk at your local RPO or lodge a grievance on the PGPORTAL.',
    faqs: [
      { question: 'Can I apply via Tatkaal scheme?', answer: 'Yes, Tatkaal delivers passports within 1-3 days for an additional fee of ₹2000.' },
      { question: 'What if my present address is different from my permanent address?', answer: 'You must provide proof for your present address where you are currently residing.' }
    ]
  },
  finance: {
    website: 'https://incometax.gov.in',
    helpline: '1800-180-1961 (Income Tax Dept)',
    eligibility: [
      'Indian citizens earning taxable income or eligible for savings schemes.',
      'Possess a valid PAN Card linked to Aadhaar.',
      'Active bank account linked to Aadhaar for subsidy/refund deposits.'
    ],
    documents: [
      { name: 'PAN Card', description: 'Permanent Account Number Card', howToGet: 'Apply via NSDL portal with identity proof.', alternatives: 'e-PAN PDF' },
      { name: 'Bank Passbook', description: 'Proof of active bank account and IFSC details', howToGet: 'Collect from your bank branch.', alternatives: 'Cancelled cheque leaf' },
      { name: 'Income Certificate', description: 'Officially certified family income statement', howToGet: 'Apply through your local Tehsil/District office.', alternatives: 'ITR acknowledgement receipt' }
    ],
    steps: [
      { title: 'Portal Registration', description: 'Sign up on the designated government financial portal.', subSteps: ['Register with your PAN/Aadhaar.', 'Verify via mobile OTP.', 'Create secure login details.'], tips: ['Ensure bank account is pre-validated for refund credits.'], warnings: ['Never share your login passwords or PINs.'], time: '20 mins', mode: 'online' },
      { title: 'Form Submission', description: 'Complete the relevant scheme form or ITR declaration.', subSteps: ['Input income and asset declarations.', 'Declare applicable deductions (80C, etc.).', 'Upload bank details.'], tips: ['Keep Form 16 / bank statement handy.'], warnings: ['Filing incorrect data can attract tax penalties.'], time: '1 hour', mode: 'online' },
      { title: 'Electronic Verification (e-Verify)', description: 'Verify your submission using Aadhaar OTP.', subSteps: ['Select "e-Verify Now".', 'Enter the OTP received on Aadhaar-linked mobile.', 'Download acknowledgement slip.'], tips: ['Complete verification within 30 days of submission.'], warnings: ['Without e-verification, your submission will be treated as invalid.'], time: '5 mins', mode: 'online' }
    ],
    mistakes: ['Bank account not linked to Aadhaar.', 'Typing incorrect bank IFSC code.', 'Missing the e-verify timeline.'],
    rejection: 'Rejections occur due to data mismatches between PAN and Aadhaar or bank name spelling. Correct your profile in the bank database to match your Aadhaar, then resubmit.',
    complaint: 'Submit grievances directly through the e-Nivaran tab on the Income Tax e-filing portal.',
    faqs: [
      { question: 'Is linking Aadhaar and PAN mandatory?', answer: 'Yes, it is legally mandatory for filing taxes and opening bank accounts.' },
      { question: 'What is e-Verify?', answer: 'It is an OTP-based online authentication that replaces sending a physical signed form to the central office.' }
    ]
  },
  education: {
    website: 'https://scholarships.gov.in',
    helpline: '0120-6619540 (NSP Helpdesk)',
    eligibility: [
      'Enrolled in a recognized school, college, or skill center.',
      'Belong to eligible category thresholds (ITR limits or category quotas).',
      'Satisfy minimum academic scoring requirements (e.g. 50% or above in previous class).'
    ],
    documents: [
      { name: 'Bonafide Student Certificate', description: 'Proof of active enrollment in college/school', howToGet: 'Request from your institution administration.', alternatives: 'College fee receipt, student ID card' },
      { name: 'Income Certificate of Parents', description: 'Officially certified family annual income proof', howToGet: 'Apply via District revenue office.', alternatives: 'Salary slip of parents, ITR receipt' },
      { name: 'Academic Marksheets', description: 'Evidence of previous class passing score', howToGet: 'Collect from your school board / college controller.', alternatives: 'DigiLocker verified marksheets' }
    ],
    steps: [
      { title: 'NSP Registration', description: 'Create a student profile on the National Scholarship Portal.', subSteps: ['Enter state of domicile and academic category.', 'Provide bank account details.', 'Complete registration to get Student ID.'], tips: ['Double-check the IFSC code to ensure direct bank transfer works.'], warnings: ['A student can only apply for one scholarship scheme per year.'], time: '30 mins', mode: 'online' },
      { title: 'Application Form Submission', description: 'Fill the comprehensive academic and category form.', subSteps: ['Log in with Student ID.', 'Enter father\'s occupation and annual income.', 'Select the matching scholarship scheme.'], tips: ['Select the scheme carefully matching your category.'], warnings: ['Uploading forged certificates leads to permanent blacklisting.'], time: '1 hour', mode: 'online' },
      { title: 'Upload and Submit', description: 'Upload all scanned original certificates.', subSteps: ['Scan documents cleanly.', 'Upload PDF/JPEG files under 200KB.', 'Click "Final Submit".'], tips: ['Verify all uploads are readable.'], warnings: ['Once submitted, the form cannot be edited.'], time: '30 mins', mode: 'online' },
      { title: 'Institute Verification', description: 'Submit physical documents to institution nodal officer.', subSteps: ['Visit institute scholarship desk.', 'Officer verifies credentials online.', 'Application forwarded to state level.'], tips: ['Meet the nodal officer within 3 days of online submission.'], warnings: ['Failure to verify at college level cancels your application.'], time: '2-3 days', mode: 'offline' }
    ],
    mistakes: ['Not getting institution level validation.', 'Uploading wrong category documents.', 'Entering incorrect family income values.'],
    rejection: 'Educational scholarships are rejected if the student fails to meet the academic score cutoff or if family income exceeds guidelines. Ensure documents are verified at the college level on time.',
    complaint: 'Lodge queries via NSP helpdesk mail or notify your college nodal officer.',
    faqs: [
      { question: 'Can I apply for multiple scholarships?', answer: 'No, if you apply for multiple schemes, all your applications will be rejected.' },
      { question: 'What is institution verification?', answer: 'The college nodal officer must verify your student details online to validate your eligibility.' }
    ]
  }
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the scheme details from the schemes-data catalog
    const scheme = allSchemes.find((s) => s.slug === slug);

    if (!scheme) {
      return NextResponse.json(
        { success: false, error: 'Scheme not found' },
        { status: 404 }
      );
    }

    const cat = scheme.category || 'identity';
    const blueprint = CATEGORY_BLUEPRINTS[cat] || CATEGORY_BLUEPRINTS.identity;

    // Dynamically compile a high-fidelity guide using the scheme's metadata + category blueprint
    const generatedGuide = {
      title: scheme.title,
      category: scheme.category,
      icon: scheme.icon,
      tagline: scheme.tagline,
      officialWebsite: blueprint.website,
      helpline: blueprint.helpline,
      fee: scheme.fee,
      estimatedTime: scheme.estimatedTime,
      difficulty: scheme.difficulty,
      eligibility: blueprint.eligibility,
      requiredDocuments: blueprint.documents,
      steps: blueprint.steps.map((step, idx) => ({
        stepNumber: idx + 1,
        title: step.title.replace('NSP', scheme.provider).replace('PSK', scheme.provider),
        description: step.description.replace('uidai.gov.in', blueprint.website.replace('https://', '')),
        subSteps: step.subSteps.map(ss => ss.replace('uidai.gov.in', blueprint.website.replace('https://', ''))),
        tips: step.tips,
        warnings: step.warnings,
        estimatedTime: step.time,
        mode: step.mode
      })),
      commonMistakes: blueprint.mistakes,
      ifRejected: blueprint.rejection,
      complaintProcess: blueprint.complaint,
      faqs: blueprint.faqs,
      relatedSchemes: allSchemes
        .filter((s) => s.category === scheme.category && s.id !== scheme.id)
        .slice(0, 3)
        .map((s) => s.title)
    };

    return NextResponse.json({
      success: true,
      data: generatedGuide
    });

  } catch (err) {
    console.error('Error generating guide:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error generating guide blueprint' },
      { status: 500 }
    );
  }
}
