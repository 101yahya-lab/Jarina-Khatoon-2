import 'package:flutter/material.dart';
import 'login_screen.dart';

void main() {
  runApp(const HasanBabuClinicApp());
}

class HasanBabuClinicApp extends StatelessWidget {
  const HasanBabuClinicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'हसन बाबू का अस्पताल',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.teal,
        fontFamily: 'NotoSansDevanagari',
      ),
      home: const LoginScreen(),
    );
  }
}
