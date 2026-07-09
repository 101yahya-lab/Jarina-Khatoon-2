import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../services/network_service.dart';
import 'prescription_screen.dart';

class DoctorDashboard extends StatefulWidget {
  const DoctorDashboard({super.key});

  @override
  State<DoctorDashboard> createState() => _DoctorDashboardState();
}

class _DoctorDashboardState extends State<DoctorDashboard> {
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _queue = [];

  @override
  void initState() {
    super.initState();
    _loadQueue();
  }

  Future<void> _loadQueue() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      final response = await NetworkService.get(
        ApiConfig.opdQueue,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        setState(() {
          _queue = data['queue'] ?? [];
        });
      } else {
        setState(() {
          _errorMessage = data['message'] ?? 'Queue load nahi ho payi.';
        });
      }
    } catch (e) {
      final errorMsg = NetworkService.getErrorMessage(e);
      setState(() => _errorMessage = errorMsg);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Doctor Dashboard"),
        backgroundColor: Colors.teal,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadQueue,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadQueue,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return ListView(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Icon(Icons.error_outline, color: Colors.red.shade400, size: 48),
                const SizedBox(height: 12),
                Text(
                  _errorMessage!,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.red.shade700),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadQueue,
                  child: const Text("Dobara try karein"),
                ),
              ],
            ),
          ),
        ],
      );
    }

    if (_queue.isEmpty) {
      return ListView(
        children: const [
          Padding(
            padding: EdgeInsets.all(32),
            child: Center(
              child: Text(
                "आज कोई मरीज़ लाइन में नहीं है।",
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
          ),
        ],
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: _queue.length,
      itemBuilder: (context, index) {
        final item = _queue[index];
        final isWaiting = item['status'] == 'waiting';

        return Card(
          margin: const EdgeInsets.symmetric(vertical: 6),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: Colors.teal,
              child: Text(
                '${item['token_number']}',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            title: Text(item['full_name'] ?? ''),
            subtitle: Text(
              "${item['hba_id'] ?? ''} • ${item['age'] ?? '-'} yrs, ${item['gender'] ?? '-'}\n"
              "${item['complaint'] ?? 'Shikayat darj nahi'}",
            ),
            isThreeLine: true,
            trailing: Chip(
              label: Text(isWaiting ? "Waiting" : item['status'] ?? ''),
              backgroundColor: isWaiting ? Colors.orange.shade100 : Colors.green.shade100,
            ),
            onTap: () async {
              final result = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => PrescriptionScreen(visit: item),
                ),
              );
              if (result == true) {
                _loadQueue();
              }
            },
          ),
        );
      },
    );
  }
}