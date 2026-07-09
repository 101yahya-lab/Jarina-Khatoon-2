// ============================================================
// API Configuration - Hasan Babu Ka Aspataal Flutter Client
// ============================================================
class ApiConfig {
  // आपका Railway पर लाइव प्रोडक्शन बैकएंड URL
  static const String baseUrl = "https://jarina-khatoon-production.up.railway.app/api";

  // Authentication Endpoints
  static const String login = "$baseUrl/auth/login";
  static const String register = "$baseUrl/call/register"; // बैकएंड के /api/auth/register से मैच है

  // Patient Management Endpoints
  static const String patients = "$baseUrl/patients";
  static const String todayQueue = "$baseUrl/patients/today-queue";
  
  // 💡 सुझाव: किसी मरीज की प्रोफाइल HBA ID से देखने के लिए इसे जोड़ा गया है
  static String getPatientDetails(String hbaId) => "$baseUrl/patients/$hbaId";

  // OPD & Token Management Endpoints
  static const String opdQueue = "$baseUrl/opd/queue";
  static const String opdCheckin = "$baseUrl/opd/checkin";
  
  // डॉक्टर द्वारा पर्चा (Prescription) सेव करने के लिए डायनामिक राउट
  static String opdPrescription(int visitId) => "$baseUrl/opd/$visitId/prescription";
}
