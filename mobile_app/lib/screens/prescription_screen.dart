import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../services/network_service.dart';

class PrescriptionScreen extends StatefulWidget {
  final Map<String, dynamic> visit;

  const PrescriptionScreen({super.key, required this.visit});

  @override
  State<PrescriptionScreen> createState() => _PrescriptionScreenState();
}

class _PrescriptionScreenState extends State<PrescriptionScreen> {
  final _diagnosisController = TextEditingController();
  final _prescriptionController = TextEditingController();
  bool _isSaving = false;
  String? _errorMessage;

  Future<void> _savePrescription() async {
    final diagnosisText = _diagnosisController.text.trim();
    final prescriptionText = _prescriptionController.text.trim();

    // 💡 वैलिडेशन: अगर दोनों फील्ड्स खाली हैं तो डॉक्टर को रोकें
    if (diagnosisText.isEmpty && prescriptionText.isEmpty) {
      setState(() => _errorMessage = "Kripya Diagnosis ya Prescription mein se kuch likhein.");
      return;
    }

    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      
      // 💡 सेफ्टी चेक: अगर visit_id न मिले तो id का इस्तेमाल करें ताकि यूआरएल null न हो
      final visitId = widget.visit['visit_id'] ?? widget.visit['id'];
      
      if (visitId == null) {
        setState(() => _errorMessage = "Error: Visit ID nahi mil payi. Dashboard ko refresh karein.");
        return;
      }

      final response = await NetworkService.put(
        ApiConfig.opdPrescription(visitId),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'diagnosis': diagnosisText,
          'prescription': prescriptionText,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        if (!mounted) return;
        // 💡 सफलता पूर्वक सेव होने पर true भेजें ताकि पिछला पेज (Dashboard) अपने आप रीफ्रेश हो जाए
        Navigator.pop(context, true);
      } else {
        setState(() => _errorMessage = data['message'] ?? 'Save nahi ho paya.');
      }
    } catch (e) {
      final errorMsg = NetworkService.getErrorMessage(e);
      setState(() => _errorMessage = errorMsg);
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final v = widget.visit;

    return Scaffold(
      appBar: AppBar(
        title: const Text("मरीज़ का पर्चा (Prescription)"),
        backgroundColor: Colors.teal,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // मरीज़ की जानकारी का कार्ड
            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      v['full_name'] ?? 'Agyat Mariz',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.teal),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      "${v['hba_id'] ?? ''} • ${v['age'] ?? '-'} Yrs, ${v['gender'] ?? '-'}",
                      style: TextStyle(color: Colors.grey.shade700, fontWeight: FontWeight.w500),
                    ),
                    if ((v['complaint'] ?? '').toString().isNotEmpty) ...[
                      const Divider(height: 20),
                      Text(
                        "मुख्य शिकायत (Complaint):", 
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey.shade800),
                      ),
                      const SizedBox(height: 4),
                      Text("${v['complaint']}", style: const TextStyle(fontStyle: FontStyle.italic)),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            
            // Diagnosis Input
            const Text("Diagnosis (बीमारी की पहचान)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            TextField(
              controller: _diagnosisController,
              maxLines: 2,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: "जैसे: Fever, Hypertension, Upper Respiratory Infection...",
              ),
            ),
            const SizedBox(height: 20),
            
            // Prescription Input
            const Text("Prescription (दवाइयाँ और निर्देश)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 8),
            TextField(
              controller: _prescriptionController,
              maxLines: 6,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                hintText: "जैसे:\n1. Tab Paracetamol 650mg - 1-0-1 (Khane ke baad)\n2. Syr Alex - 5ml - Din me 3 baar",
              ),
            ),
            const SizedBox(height: 20),
            
            // एरर मैसेज डिस्प्ले
            if (_errorMessage != null) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _errorMessage!,
                  style: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.w500),
                ),
              ),
              const SizedBox(height: 16),
            ],
            
            // सेव बटन
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _savePrescription,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: _isSaving
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text("Save & Complete", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _diagnosisController.dispose();
    _prescriptionController.dispose();
    super.dispose();
  }
}
