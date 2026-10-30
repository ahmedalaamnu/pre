/**
 * رابعة طب — Curriculum Data Definition & Initial Seeds
 * Provides the official fourth-year medical curriculum, default configuration,
 * and data models with stable IDs.
 */

const DEFAULT_EXAM_SETTINGS = {
  title: "Fourth Year Final Medical Board Examination",
  date: "2027-02-19",
  time: "09:00",
  notes: "Unified National Clinical & Written Medical Board"
};

const DEFAULT_PREFERENCES = {
  density: "comfortable", // "comfortable" | "compact"
  theme: "navy-gold"
};

const INITIAL_SUBJECTS_DATA = [
  {
    id: "subj-pediatrics",
    name: "Pediatrics",
    icon: "baby",
    color: "#C99A2E",
    order: 1,
    branches: [
      {
        id: "br-ped-neonatology",
        name: "Neonatology",
        order: 1,
        lectures: [
          { id: "lec-ped-neo-1", title: "Respiratory Distress", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-neo-2", title: "Neonatal Sepsis & Congenital Infections", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 },
          { id: "lec-ped-neo-3", title: "Apgar Score", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ped-neo-4", title: "Jaundice", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 }
        ]
      },
      {
        id: "br-ped-nutritional",
        name: "Nutritional Disorders",
        order: 2,
        lectures: [
          { id: "lec-ped-nut-1", title: "Growth and Development", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-nut-2", title: "Protein-Energy Malnutrition", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-nut-3", title: "Rickets", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ped-nut-4", title: "Infant Feeding", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 }
        ]
      },
      {
        id: "br-ped-respiratory",
        name: "Respiratory",
        order: 3,
        lectures: [
          { id: "lec-ped-resp-1", title: "Pneumonia", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-resp-2", title: "Pleural Diseases", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ped-resp-3", title: "Upper Respiratory Diseases", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 }
        ]
      },
      {
        id: "br-ped-hematology",
        name: "Hematology",
        order: 4,
        lectures: [
          { id: "lec-ped-hem-1", title: "Coagulation Disorders", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-hem-2", title: "Platelet Disorders", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-hem-3", title: "Anemia & Hemolytic Anemia", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 }
        ]
      },
      {
        id: "br-ped-gastroenterology",
        name: "Gastroenterology",
        order: 5,
        lectures: [
          { id: "lec-ped-gi-1", title: "Oral Cavity", completed: false, notes: "", priority: "low", durationMin: 30, rating: 0 },
          { id: "lec-ped-gi-2", title: "Constipation & GI Bleeding", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-gi-3", title: "Acute & Chronic Diarrhea", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-gi-4", title: "Vomiting", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 }
        ]
      },
      {
        id: "br-ped-cardiology",
        name: "Cardiology",
        order: 6,
        lectures: [
          { id: "lec-ped-card-1", title: "Introduction to Pediatric Cardiology", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ped-card-2", title: "Acyanotic Congenital Heart Disease", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 },
          { id: "lec-ped-card-3", title: "Congenital Cyanotic Heart Disease", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 },
          { id: "lec-ped-card-4", title: "Heart Failure & Obstructive Lesions", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-card-5", title: "Rheumatic Heart Disease", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-card-6", title: "Infective Endocarditis", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 }
        ]
      },
      {
        id: "br-ped-nephrology",
        name: "Nephrology",
        order: 7,
        lectures: [
          { id: "lec-ped-neph-1", title: "UTI and VUR", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-neph-2", title: "Hematuria & Glomerulonephritis", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 },
          { id: "lec-ped-neph-3", title: "Polycystic Kidney Disease", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ped-neph-4", title: "Proteinuria & Nephrotic Syndrome", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 }
        ]
      },
      {
        id: "br-ped-neurology",
        name: "Neurology",
        order: 8,
        lectures: [
          { id: "lec-ped-neuro-1", title: "Seizures & Epilepsy", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 },
          { id: "lec-ped-neuro-2", title: "Cerebral Palsy & Neurodegenerative Disorders", completed: false, notes: "", priority: "medium", durationMin: 60, rating: 0 },
          { id: "lec-ped-neuro-3", title: "CNS Anomalies", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ped-neuro-4", title: "Neuromuscular Diseases", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 }
        ]
      },
      {
        id: "br-ped-endocrine",
        name: "Endocrine & Adolescent Medicine",
        order: 9,
        lectures: [
          { id: "lec-ped-endo-1", title: "Endocrine Disorders", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-endo-2", title: "Adrenal Gland Disorders", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-endo-3", title: "Puberty & Its Abnormalities", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-endo-4", title: "Thyroid & Parathyroid Disorders", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-endo-5", title: "Diabetes Mellitus", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 }
        ]
      },
      {
        id: "br-ped-infectious",
        name: "Infectious Diseases",
        order: 10,
        lectures: [
          { id: "lec-ped-inf-1", title: "Bacterial Meningitis", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-inf-2", title: "Bacterial Infections", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-inf-3", title: "Viral Infections", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 }
        ]
      },
      {
        id: "br-ped-allergy",
        name: "Allergy",
        order: 11,
        lectures: [
          { id: "lec-ped-alg-1", title: "Bronchial Asthma", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 }
        ]
      },
      {
        id: "br-ped-rheumatology",
        name: "Rheumatology",
        order: 12,
        lectures: [
          { id: "lec-ped-rheum-1", title: "Juvenile Idiopathic Arthritis (JIA)", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ped-rheum-2", title: "Childhood SLE", completed: false, notes: "", priority: "high", durationMin: 55, rating: 0 },
          { id: "lec-ped-rheum-3", title: "Vasculitis & HSP", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ped-rheum-4", title: "Kawasaki Disease", completed: false, notes: "", priority: "high", durationMin: 50, rating: 0 }
        ]
      },
      {
        id: "br-ped-immunology",
        name: "Immunology",
        order: 13,
        lectures: [
          { id: "lec-ped-imm-1", title: "Approach to Immunodeficiency", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 }
        ]
      },
      {
        id: "br-ped-oncology",
        name: "Oncology",
        order: 14,
        lectures: [
          { id: "lec-ped-onc-1", title: "Leukemia & Lymphoma", completed: false, notes: "", priority: "high", durationMin: 70, rating: 0 }
        ]
      },
      {
        id: "br-ped-genetics",
        name: "Genetics",
        order: 15,
        lectures: [
          { id: "lec-ped-gen-1", title: "Genetic Syndromes", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 }
        ]
      },
      {
        id: "br-ped-hepatology",
        name: "Hepatology",
        order: 16,
        lectures: [
          { id: "lec-ped-hep-1", title: "Hepatology", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 }
        ]
      }
    ]
  },
  {
    id: "subj-anesthesia",
    name: "Anesthesia",
    icon: "syringe",
    color: "#46B889",
    order: 2,
    branches: [
      {
        id: "br-anes-general",
        name: "General Anesthesia & Perioperative Care",
        order: 1,
        lectures: [
          { id: "lec-ane-1", title: "Preoperative Care", completed: false, notes: "", priority: "high", durationMin: 50, rating: 0 },
          { id: "lec-ane-2", title: "General Anesthesia", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ane-3", title: "Regional Anaesthesia", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ane-4", title: "Intraoperative Anesthetic Risk", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ane-5", title: "Basic Monitoring", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-ane-6", title: "Airway Management", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 },
          { id: "lec-ane-7", title: "Basic Life Support", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-ane-8", title: "Postoperative Pain Management", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ane-9", title: "Postoperative Complications 1 & 2", completed: false, notes: "", priority: "high", durationMin: 70, rating: 0 },
          { id: "lec-ane-10", title: "Fluid Therapy", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-ane-11", title: "Oxygen Therapy", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 }
        ]
      }
    ]
  },
  {
    id: "subj-psychiatry",
    name: "Psychiatry",
    icon: "brain",
    color: "#9B72CF",
    order: 3,
    branches: [
      {
        id: "br-psych-topics",
        name: "Psychiatry Topics",
        order: 1,
        lectures: [
          { id: "lec-psy-1", title: "Anxiety Disorders", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-psy-2", title: "Depressive, Bipolar, and Related Disorders", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 },
          { id: "lec-psy-3", title: "Schizophrenia and Other Psychotic Disorders", completed: false, notes: "", priority: "high", durationMin: 80, rating: 0 },
          { id: "lec-psy-4", title: "Somatic Symptom and Related Disorders", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-psy-5", title: "Eating Disorders", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-psy-6", title: "Adjustment Disorders", completed: false, notes: "", priority: "low", durationMin: 35, rating: 0 },
          { id: "lec-psy-7", title: "Substance Use Disorders", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 },
          { id: "lec-psy-8", title: "Suicide", completed: false, notes: "", priority: "high", durationMin: 50, rating: 0 },
          { id: "lec-psy-9", title: "Psychopharmacology", completed: false, notes: "", priority: "high", durationMin: 80, rating: 0 },
          { id: "lec-psy-10", title: "Normal Sleep and Sleep Disorders", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 }
        ]
      }
    ]
  },
  {
    id: "subj-tropical",
    name: "Tropical Medicine",
    icon: "globe",
    color: "#E9A23B",
    order: 4,
    branches: [
      {
        id: "br-trop-topics",
        name: "Tropical Medicine Topics",
        order: 1,
        lectures: [
          { id: "lec-trop-1", title: "Approach to Fever", completed: false, notes: "", priority: "high", durationMin: 55, rating: 0 },
          { id: "lec-trop-2", title: "Travel Medicine & Immunization", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-trop-3", title: "Nosocomial Infection", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-trop-4", title: "Heat Disorders", completed: false, notes: "", priority: "low", durationMin: 40, rating: 0 },
          { id: "lec-trop-5", title: "Tropical Infections", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 },
          { id: "lec-trop-6", title: "H. pylori", completed: false, notes: "", priority: "medium", durationMin: 45, rating: 0 },
          { id: "lec-trop-7", title: "Salmonellosis & Brucellosis", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 },
          { id: "lec-trop-8", title: "HIV & Opportunistic Infections", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 },
          { id: "lec-trop-9", title: "CMV, Tetanus & Rabies", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-trop-10", title: "Gastrointestinal Infections", completed: false, notes: "", priority: "medium", durationMin: 55, rating: 0 },
          { id: "lec-trop-11", title: "Abdominal Tuberculosis", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-trop-12", title: "Fever of Unknown Origin", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 },
          { id: "lec-trop-13", title: "Emerging Infections (COVID-19)", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-trop-14", title: "Acute Viral Hepatitis", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-trop-15", title: "Chronic HBV & HCV", completed: false, notes: "", priority: "high", durationMin: 70, rating: 0 },
          { id: "lec-trop-16", title: "Portal Hypertension", completed: false, notes: "", priority: "high", durationMin: 65, rating: 0 },
          { id: "lec-trop-17", title: "Acute Liver Failure", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 }
        ]
      }
    ]
  },
  {
    id: "subj-rheumatology",
    name: "Rheumatology",
    icon: "activity",
    color: "#54A0FF",
    order: 5,
    branches: [
      {
        id: "br-rheum-topics",
        name: "Rheumatology Topics",
        order: 1,
        lectures: [
          { id: "lec-rheum-1", title: "Rheumatoid Arthritis", completed: false, notes: "", priority: "high", durationMin: 70, rating: 0 },
          { id: "lec-rheum-2", title: "SLE", completed: false, notes: "", priority: "high", durationMin: 75, rating: 0 },
          { id: "lec-rheum-3", title: "Spondyloarthropathies", completed: false, notes: "", priority: "high", durationMin: 60, rating: 0 },
          { id: "lec-rheum-4", title: "Systemic Sclerosis", completed: false, notes: "", priority: "medium", durationMin: 55, rating: 0 },
          { id: "lec-rheum-5", title: "Crystal-Induced Arthritis", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 },
          { id: "lec-rheum-6", title: "Inflammatory Myopathies", completed: false, notes: "", priority: "medium", durationMin: 50, rating: 0 }
        ]
      }
    ]
  }
];

function generateId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

