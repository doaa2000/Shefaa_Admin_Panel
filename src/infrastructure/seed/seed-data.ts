/**
 * Seed data — ported verbatim from the design's data.js, reshaped into domain
 * entities. Used by the local (in-memory) repositories and as fallback content.
 */
import type { Specialization } from '@/domain/entities/Specialization';
import type { Doctor } from '@/domain/entities/Doctor';
import type { Patient } from '@/domain/entities/Patient';
import type { Governorate } from '@/domain/entities/Location';
import type { Appointment } from '@/domain/entities/Appointment';
import type { DashboardStats } from '@/domain/entities/DashboardStats';
import { DoctorStatus, PatientStatus, AppointmentStatus } from '@/domain/enums';
import { colorAt } from '@/shared/utils/color';

export const SEED_SPECIALIZATIONS: Specialization[] = [
  { id: 'sp1', nameEn: 'Cardiology', nameAr: 'أمراض القلب', descEn: 'Diagnosis and treatment of heart and vascular conditions.', descAr: 'تشخيص وعلاج أمراض القلب والأوعية الدموية.', icon: 'heart', color: '#D6533F', baseFee: 700 },
  { id: 'sp2', nameEn: 'Dermatology', nameAr: 'الجلدية', descEn: 'Care for skin, hair and nail conditions.', descAr: 'العناية بأمراض الجلد والشعر والأظافر.', icon: 'sparkle', color: '#C98A1E', baseFee: 500 },
  { id: 'sp3', nameEn: 'Pediatrics', nameAr: 'طب الأطفال', descEn: 'Medical care for infants, children and adolescents.', descAr: 'الرعاية الطبية للرضع والأطفال والمراهقين.', icon: 'baby', color: '#67B2D8', baseFee: 450 },
  { id: 'sp4', nameEn: 'Orthopedics', nameAr: 'العظام', descEn: 'Bones, joints, ligaments and musculoskeletal care.', descAr: 'رعاية العظام والمفاصل والأربطة والجهاز الحركي.', icon: 'bone', color: '#5A8FB0', baseFee: 550 },
  { id: 'sp5', nameEn: 'Dentistry', nameAr: 'الأسنان', descEn: 'Oral health, dental treatment and cosmetic dentistry.', descAr: 'صحة الفم وعلاج الأسنان وتجميلها.', icon: 'tooth', color: '#7B6FCB', baseFee: 500 },
  { id: 'sp6', nameEn: 'Neurology', nameAr: 'المخ والأعصاب', descEn: 'Disorders of the brain, spine and nervous system.', descAr: 'اضطرابات المخ والعمود الفقري والجهاز العصبي.', icon: 'brain', color: '#9B7BC9', baseFee: 650 },
  { id: 'sp7', nameEn: 'Gynecology', nameAr: 'النساء والتوليد', descEn: "Women's reproductive health and pregnancy care.", descAr: 'صحة المرأة الإنجابية ورعاية الحمل.', icon: 'heart', color: '#D67BA0', baseFee: 600 },
  { id: 'sp8', nameEn: 'Ophthalmology', nameAr: 'العيون', descEn: 'Eye examinations, vision and surgical eye care.', descAr: 'فحص العيون والنظر والجراحة.', icon: 'eye', color: '#4A93BC', baseFee: 500 },
  { id: 'sp9', nameEn: 'ENT', nameAr: 'الأنف والأذن والحنجرة', descEn: 'Ear, nose and throat diagnosis and treatment.', descAr: 'تشخيص وعلاج الأنف والأذن والحنجرة.', icon: 'ear', color: '#2E9E73', baseFee: 450 },
  { id: 'sp10', nameEn: 'Psychiatry', nameAr: 'الطب النفسي', descEn: 'Mental health assessment and therapy.', descAr: 'تقييم الصحة النفسية والعلاج النفسي.', icon: 'brain', color: '#6B7785', baseFee: 600 },
];

export const SEED_LOCATIONS: Governorate[] = [
  { id: 'g1', nameEn: 'Cairo', nameAr: 'القاهرة', cities: [
    { id: 'c1', nameEn: 'Nasr City', nameAr: 'مدينة نصر', clinics: [
      { id: 'cl1', nameEn: 'Shefaa Heart Center', nameAr: 'مركز شفاء للقلب' },
      { id: 'cl2', nameEn: 'Nasr Medical Tower', nameAr: 'برج نصر الطبي' },
    ] },
    { id: 'c2', nameEn: 'Maadi', nameAr: 'المعادي', clinics: [
      { id: 'cl3', nameEn: 'Maadi Family Clinic', nameAr: 'عيادة المعادي للأسرة' },
    ] },
    { id: 'c3', nameEn: 'Heliopolis', nameAr: 'مصر الجديدة', clinics: [
      { id: 'cl4', nameEn: 'Korba Specialist Clinic', nameAr: 'عيادة الكوربة التخصصية' },
    ] },
  ] },
  { id: 'g2', nameEn: 'Giza', nameAr: 'الجيزة', cities: [
    { id: 'c4', nameEn: 'Dokki', nameAr: 'الدقي', clinics: [
      { id: 'cl5', nameEn: 'Dokki Dental Studio', nameAr: 'استوديو الدقي للأسنان' },
    ] },
    { id: 'c5', nameEn: '6th of October', nameAr: '٦ أكتوبر', clinics: [
      { id: 'cl6', nameEn: 'October Care Hospital', nameAr: 'مستشفى أكتوبر كير' },
      { id: 'cl7', nameEn: 'Sheikh Zayed Polyclinic', nameAr: 'عيادات الشيخ زايد' },
    ] },
  ] },
  { id: 'g3', nameEn: 'Alexandria', nameAr: 'الإسكندرية', cities: [
    { id: 'c6', nameEn: 'Smouha', nameAr: 'سموحة', clinics: [
      { id: 'cl8', nameEn: 'Smouha Eye Center', nameAr: 'مركز سموحة للعيون' },
    ] },
    { id: 'c7', nameEn: 'Sidi Gaber', nameAr: 'سيدي جابر', clinics: [
      { id: 'cl9', nameEn: 'Corniche Skin Clinic', nameAr: 'عيادة الكورنيش للجلدية' },
    ] },
  ] },
  { id: 'g4', nameEn: 'Dakahlia', nameAr: 'الدقهلية', cities: [
    { id: 'c8', nameEn: 'Mansoura', nameAr: 'المنصورة', clinics: [
      { id: 'cl10', nameEn: 'Mansoura Children Clinic', nameAr: 'عيادة المنصورة للأطفال' },
    ] },
  ] },
];

interface ClinicRef {
  cityEn: string;
  cityAr: string;
  govEn: string;
  govAr: string;
}

const CLINIC_REF: Record<string, ClinicRef> = {
  cl1: { cityEn: 'Nasr City', cityAr: 'مدينة نصر', govEn: 'Cairo', govAr: 'القاهرة' },
  cl2: { cityEn: 'Nasr City', cityAr: 'مدينة نصر', govEn: 'Cairo', govAr: 'القاهرة' },
  cl3: { cityEn: 'Maadi', cityAr: 'المعادي', govEn: 'Cairo', govAr: 'القاهرة' },
  cl4: { cityEn: 'Heliopolis', cityAr: 'مصر الجديدة', govEn: 'Cairo', govAr: 'القاهرة' },
  cl5: { cityEn: 'Dokki', cityAr: 'الدقي', govEn: 'Giza', govAr: 'الجيزة' },
  cl6: { cityEn: '6th of October', cityAr: '٦ أكتوبر', govEn: 'Giza', govAr: 'الجيزة' },
  cl7: { cityEn: '6th of October', cityAr: '٦ أكتوبر', govEn: 'Giza', govAr: 'الجيزة' },
  cl8: { cityEn: 'Smouha', cityAr: 'سموحة', govEn: 'Alexandria', govAr: 'الإسكندرية' },
  cl9: { cityEn: 'Sidi Gaber', cityAr: 'سيدي جابر', govEn: 'Alexandria', govAr: 'الإسكندرية' },
  cl10: { cityEn: 'Mansoura', cityAr: 'المنصورة', govEn: 'Dakahlia', govAr: 'الدقهلية' },
};

export function clinicNameEn(id: string): string {
  for (const g of SEED_LOCATIONS) for (const c of g.cities) for (const cl of c.clinics) if (cl.id === id) return cl.nameEn;
  return '';
}
export function clinicNameAr(id: string): string {
  for (const g of SEED_LOCATIONS) for (const c of g.cities) for (const cl of c.clinics) if (cl.id === id) return cl.nameAr;
  return '';
}

const specById = (id: string) => SEED_SPECIALIZATIONS.find((s) => s.id === id)!;

type DoctorTuple = [string, string, string, string, number, DoctorStatus];
const DOCTOR_TUPLES: DoctorTuple[] = [
  ['Ahmed El-Sayed', 'أحمد السيد', 'sp1', 'cl1', 700, DoctorStatus.Active],
  ['Mona Khalil', 'منى خليل', 'sp2', 'cl9', 600, DoctorStatus.Active],
  ['Tarek Mansour', 'طارق منصور', 'sp3', 'cl10', 450, DoctorStatus.Active],
  ['Hana Fawzy', 'هناء فوزي', 'sp4', 'cl6', 550, DoctorStatus.Active],
  ['Omar Selim', 'عمر سليم', 'sp5', 'cl5', 500, DoctorStatus.Active],
  ['Nour Adel', 'نور عادل', 'sp6', 'cl4', 650, DoctorStatus.Inactive],
  ['Yasmin Saad', 'ياسمين سعد', 'sp7', 'cl3', 600, DoctorStatus.Active],
  ['Khaled Rashad', 'خالد رشاد', 'sp8', 'cl8', 500, DoctorStatus.Active],
  ['Salma Gamal', 'سلمى جمال', 'sp9', 'cl4', 450, DoctorStatus.Active],
  ['Hossam Nabil', 'حسام نبيل', 'sp10', 'cl1', 800, DoctorStatus.Active],
  ['Dina Aziz', 'دينا عزيز', 'sp2', 'cl9', 600, DoctorStatus.Inactive],
  ['Sherif Lotfy', 'شريف لطفي', 'sp1', 'cl2', 750, DoctorStatus.Active],
  ['Rana Wael', 'رنا وائل', 'sp7', 'cl3', 600, DoctorStatus.Active],
  ['Karim Fouad', 'كريم فؤاد', 'sp4', 'cl6', 520, DoctorStatus.Active],
];

export const SEED_DOCTORS: Doctor[] = DOCTOR_TUPLES.map((d, i) => {
  const [nameEn, nameAr, specializationId, clinicId, fee, status] = d;
  const c = CLINIC_REF[clinicId];
  const sp = specById(specializationId);
  const fn = nameEn.toLowerCase().replace(/[^a-z]/g, '.');
  return {
    id: 'd' + (i + 1),
    nameEn: 'Dr. ' + nameEn,
    nameAr: 'د. ' + nameAr,
    email: fn + '@shefaa.eg',
    specializationId,
    specialtyEn: sp.nameEn,
    specialtyAr: sp.nameAr,
    clinicId,
    clinicEn: clinicNameEn(clinicId),
    clinicAr: clinicNameAr(clinicId),
    cityEn: c.cityEn,
    cityAr: c.cityAr,
    govEn: c.govEn,
    govAr: c.govAr,
    fee,
    status,
    color: colorAt(i),
  };
});

type PatientTuple = [string, string, string, number];
const PATIENT_TUPLES: PatientTuple[] = [
  ['Mariam Adel', 'مريم عادل', '0100 234 5566', 9],
  ['Youssef Hany', 'يوسف هاني', '0111 998 2210', 4],
  ['Layla Mostafa', 'ليلى مصطفى', '0122 445 1180', 12],
  ['Amir Zaki', 'أمير زكي', '0100 776 3321', 2],
  ['Farida Sami', 'فريدة سامي', '0128 330 9012', 7],
  ['Mahmoud Reda', 'محمود رضا', '0106 221 4498', 5],
  ['Nada Ehab', 'ندى إيهاب', '0114 556 7789', 15],
  ['Ziad Tamer', 'زياد تامر', '0109 887 2231', 3],
  ['Habiba Sherif', 'حبيبة شريف', '0127 443 1209', 8],
  ['Mostafa Galal', 'مصطفى جلال', '0101 332 8876', 1],
  ['Aya Magdy', 'آية مجدي', '0120 998 4471', 6],
  ['Omar Sobhy', 'عمر صبحي', '0112 776 5530', 10],
  ['Rania Fathy', 'رانيا فتحي', '0108 221 9943', 4],
  ['Bassem Nader', 'باسم نادر', '0115 667 1102', 2],
  ['Sara Kamal', 'سارة كمال', '0103 445 8821', 11],
  ['Tamer Anwar', 'تامر أنور', '0126 110 7763', 3],
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SEED_PATIENTS: Patient[] = PATIENT_TUPLES.map((p, i) => {
  const [nameEn, nameAr, phone, total] = p;
  return {
    id: 'u' + (i + 1),
    nameEn,
    nameAr,
    phone,
    email: nameEn.toLowerCase().replace(/[^a-z]/g, '.') + '@mail.com',
    totalBookings: total,
    status: i === 5 || i === 13 ? PatientStatus.Blocked : PatientStatus.Active,
    joined: MONTHS[(i * 3) % 12] + ' 2025',
    lastVisit: ['2d ago', '1w ago', '3d ago', '5d ago', 'today', '2w ago'][i % 6],
    color: colorAt(i + 2),
  };
});

const APPT_STATUSES = [
  AppointmentStatus.Completed,
  AppointmentStatus.Confirmed,
  AppointmentStatus.Pending,
  AppointmentStatus.Cancelled,
];

function buildAppointments(): Appointment[] {
  const out: Appointment[] = [];
  const today = new Date('2026-06-09T09:00:00');
  for (let i = 0; i < 26; i++) {
    const doc = SEED_DOCTORS[i % SEED_DOCTORS.length];
    const pat = SEED_PATIENTS[i % SEED_PATIENTS.length];
    const sp = specById(doc.specializationId);
    const d = new Date(today);
    d.setDate(d.getDate() - Math.floor(i / 2));
    d.setHours(9 + (i % 8), (i % 2) * 30, 0, 0);
    const status =
      i < 5
        ? [
            AppointmentStatus.Pending,
            AppointmentStatus.Confirmed,
            AppointmentStatus.Confirmed,
            AppointmentStatus.Pending,
            AppointmentStatus.Confirmed,
          ][i]
        : APPT_STATUSES[(i + 1) % 4];
    out.push({
      id: 'a' + (i + 1),
      patientEn: pat.nameEn,
      patientAr: pat.nameAr,
      patientColor: pat.color,
      doctorEn: doc.nameEn,
      doctorAr: doc.nameAr,
      doctorColor: doc.color,
      specializationEn: sp.nameEn,
      specializationAr: sp.nameAr,
      cityEn: doc.cityEn,
      cityAr: doc.cityAr,
      govEn: doc.govEn,
      govAr: doc.govAr,
      clinicEn: doc.clinicEn,
      clinicAr: doc.clinicAr,
      datetime: d.toISOString(),
      price: doc.fee,
      status,
    });
  }
  return out;
}

export const SEED_APPOINTMENTS: Appointment[] = buildAppointments();

export const SEED_DASHBOARD: DashboardStats = {
  bookings: { value: 1437, trend: 12.4 },
  doctors: { value: 12, trend: 4.2 },
  revenue: { value: 684500, trend: 18.7 },
  patients: { value: 3219, trend: 6.1 },
  trend: {
    monthsEn: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    monthsAr: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    values: [186, 224, 198, 271, 246, 312],
  },
  byCity: [
    { en: 'Cairo', ar: 'القاهرة', value: 428 },
    { en: 'Giza', ar: 'الجيزة', value: 316 },
    { en: 'Alexandria', ar: 'الإسكندرية', value: 244 },
    { en: 'Dakahlia', ar: 'الدقهلية', value: 137 },
  ],
};
