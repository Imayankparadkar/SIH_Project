import { db } from './db-storage';
import { medicinesTable } from '@shared/schema';

const commonMedicines = [
  {
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen', 
    manufacturer: 'Generic Pharma',
    composition: 'Acetaminophen 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 45,
    prescriptionRequired: false
  },
  {
    name: 'Amoxicillin 250mg',
    genericName: 'Amoxicillin',
    manufacturer: 'MediCore',
    composition: 'Amoxicillin 250mg',
    dosageForm: 'capsule' as const,
    strength: '250mg', 
    price: 150,
    prescriptionRequired: true
  },
  {
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    manufacturer: 'PainFree Pharma',
    composition: 'Ibuprofen 400mg',
    dosageForm: 'tablet' as const,
    strength: '400mg',
    price: 65,
    prescriptionRequired: false
  },
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    manufacturer: 'GastroMed',
    composition: 'Omeprazole 20mg',
    dosageForm: 'capsule' as const,
    strength: '20mg',
    price: 180,
    prescriptionRequired: true
  },
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine HCl',
    manufacturer: 'AllergyFree',
    composition: 'Cetirizine HCl 10mg',
    dosageForm: 'tablet' as const,
    strength: '10mg',
    price: 75,
    prescriptionRequired: false
  },
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin HCl',
    manufacturer: 'DiabetoCare',
    composition: 'Metformin HCl 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 120,
    prescriptionRequired: true
  },
  {
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin',
    manufacturer: 'InfectFree',
    composition: 'Azithromycin 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 200,
    prescriptionRequired: true
  },
  {
    name: 'Vitamin D3 1000 IU',
    genericName: 'Cholecalciferol',
    manufacturer: 'HealthVit',
    composition: 'Cholecalciferol 1000 IU',
    dosageForm: 'capsule' as const,
    strength: '1000 IU',
    price: 160,
    prescriptionRequired: false
  },
  {
    name: 'Cough Syrup 100ml',
    genericName: 'Dextromethorphan',
    manufacturer: 'CoughCure',
    composition: 'Dextromethorphan HBr 10mg/5ml',
    dosageForm: 'syrup' as const,
    strength: '10mg/5ml',
    price: 85,
    prescriptionRequired: false
  },
  {
    name: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin Calcium',
    manufacturer: 'CardioHealth',
    composition: 'Atorvastatin Calcium 20mg',
    dosageForm: 'tablet' as const,
    strength: '20mg',
    price: 140,
    prescriptionRequired: true
  },
  {
    name: 'Losartan 50mg',
    genericName: 'Losartan Potassium',
    manufacturer: 'HypertensionCare',
    composition: 'Losartan Potassium 50mg',
    dosageForm: 'tablet' as const,
    strength: '50mg',
    price: 125,
    prescriptionRequired: true
  },
  {
    name: 'Pantoprazole 40mg',
    genericName: 'Pantoprazole',
    manufacturer: 'AcidBlock',
    composition: 'Pantoprazole 40mg',
    dosageForm: 'tablet' as const,
    strength: '40mg',
    price: 95,
    prescriptionRequired: true
  },
  {
    name: 'Calcium Carbonate 500mg',
    genericName: 'Calcium Carbonate',
    manufacturer: 'BoneStrong',
    composition: 'Calcium Carbonate 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 55,
    prescriptionRequired: false
  },
  {
    name: 'Multivitamin Tablets',
    genericName: 'Multivitamin',
    manufacturer: 'VitalHealth',
    composition: 'Essential Vitamins & Minerals',
    dosageForm: 'tablet' as const,
    strength: 'Daily dose',
    price: 180,
    prescriptionRequired: false
  },
  {
    name: 'Diclofenac 50mg',
    genericName: 'Diclofenac Sodium',
    manufacturer: 'AntiPain',
    composition: 'Diclofenac Sodium 50mg',
    dosageForm: 'tablet' as const,
    strength: '50mg',
    price: 70,
    prescriptionRequired: true
  },
  {
    name: 'Levothyroxine 100mcg',
    genericName: 'Levothyroxine Sodium',
    manufacturer: 'ThyroidCare',
    composition: 'Levothyroxine Sodium 100mcg',
    dosageForm: 'tablet' as const,
    strength: '100mcg',
    price: 110,
    prescriptionRequired: true
  },
  {
    name: 'Salbutamol Inhaler',
    genericName: 'Salbutamol',
    manufacturer: 'RespiCare',
    composition: 'Salbutamol 100mcg/dose',
    dosageForm: 'inhaler' as const,
    strength: '100mcg/dose',
    price: 220,
    prescriptionRequired: true
  },
  {
    name: 'Aspirin 75mg',
    genericName: 'Acetylsalicylic Acid',
    manufacturer: 'CardioProtect',
    composition: 'Acetylsalicylic Acid 75mg',
    dosageForm: 'tablet' as const,
    strength: '75mg',
    price: 40,
    prescriptionRequired: false
  },
  {
    name: 'Montelukast 10mg',
    genericName: 'Montelukast Sodium',
    manufacturer: 'AllergyCare',
    composition: 'Montelukast Sodium 10mg',
    dosageForm: 'tablet' as const,
    strength: '10mg',
    price: 185,
    prescriptionRequired: true
  },
  {
    name: 'Ciprofloxacin 500mg',
    genericName: 'Ciprofloxacin HCl',
    manufacturer: 'AntiBiotics Plus',
    composition: 'Ciprofloxacin HCl 500mg',
    dosageForm: 'tablet' as const,
    strength: '500mg',
    price: 190,
    prescriptionRequired: true
  },
  {
    name: 'Ranitidine 150mg',
    genericName: 'Ranitidine HCl',
    manufacturer: 'AcidControl',
    composition: 'Ranitidine HCl 150mg',
    dosageForm: 'tablet' as const,
    strength: '150mg',
    price: 80,
    prescriptionRequired: false
  },
  {
    name: 'Prednisone 5mg',
    genericName: 'Prednisone',
    manufacturer: 'InflammaCure',
    composition: 'Prednisone 5mg',
    dosageForm: 'tablet' as const,
    strength: '5mg',
    price: 60,
    prescriptionRequired: true
  },
  {
    name: 'Iron Tablets 65mg',
    genericName: 'Ferrous Sulfate',
    manufacturer: 'BloodBooster',
    composition: 'Ferrous Sulfate 65mg',
    dosageForm: 'tablet' as const,
    strength: '65mg',
    price: 90,
    prescriptionRequired: false
  },
  {
    name: 'Hydrocortisone Cream 1%',
    genericName: 'Hydrocortisone',
    manufacturer: 'SkinCare',
    composition: 'Hydrocortisone 1%',
    dosageForm: 'cream' as const,
    strength: '1%',
    price: 65,
    prescriptionRequired: false
  },
  {
    name: 'Folic Acid 5mg',
    genericName: 'Folic Acid',
    manufacturer: 'VitalSupport',
    composition: 'Folic Acid 5mg',
    dosageForm: 'tablet' as const,
    strength: '5mg',
    price: 35,
    prescriptionRequired: false
  },
  {
    name: 'Loratadine 10mg',
    genericName: 'Loratadine',
    manufacturer: 'AllergyRelief',
    composition: 'Loratadine 10mg',
    dosageForm: 'tablet' as const,
    strength: '10mg',
    price: 95,
    prescriptionRequired: false
  },
  {
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine Besylate',
    manufacturer: 'HypertensionControl',
    composition: 'Amlodipine Besylate 5mg',
    dosageForm: 'tablet' as const,
    strength: '5mg',
    price: 105,
    prescriptionRequired: true
  },
  {
    name: 'Simvastatin 20mg',
    genericName: 'Simvastatin',
    manufacturer: 'CholesterolCare',
    composition: 'Simvastatin 20mg',
    dosageForm: 'tablet' as const,
    strength: '20mg',
    price: 135,
    prescriptionRequired: true
  },
  {
    name: 'Tramadol 50mg',
    genericName: 'Tramadol HCl',
    manufacturer: 'PainManager',
    composition: 'Tramadol HCl 50mg',
    dosageForm: 'tablet' as const,
    strength: '50mg',
    price: 115,
    prescriptionRequired: true
  },
  {
    name: 'Eye Drops Artificial Tears',
    genericName: 'Carboxymethylcellulose',
    manufacturer: 'EyeCare',
    composition: 'Carboxymethylcellulose 0.5%',
    dosageForm: 'drops' as const,
    strength: '0.5%',
    price: 75,
    prescriptionRequired: false
  }
];

export async function seedMedicines() {
  try {
    console.log('Seeding medicines...');
    
    // Insert all medicines
    for (const medicine of commonMedicines) {
      try {
        await db.insert(medicinesTable).values(medicine);
        console.log(`Added medicine: ${medicine.name}`);
      } catch (error: any) {
        if (error.message?.includes('duplicate key')) {
          console.log(`Medicine ${medicine.name} already exists, skipping...`);
        } else {
          console.error(`Error adding medicine ${medicine.name}:`, error);
        }
      }
    }
    
    console.log('Medicines seeding completed!');
  } catch (error) {
    console.error('Error seeding medicines:', error);
  }
}

// Run if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedMedicines().then(() => process.exit(0));
}