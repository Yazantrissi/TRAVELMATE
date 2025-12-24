import 'package:flutter/material.dart';
import '../data/models/user_model.dart';
import '../data/services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  String? _errorMessage;
  UserModel? _user;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  UserModel? get user => _user;

  // دالة تسجيل الدخول
  Future<bool> login(String identifier, String password) async {
    _setLoading(true);
    try {
      _user = await _authService.login(identifier, password);
      _setLoading(false);
      return true; // نجاح
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false; // فشل
    }
  }

  // دالة إنشاء الحساب
  Future<bool> register(String username, String email, String phone, String password) async {
    _setLoading(true);
    try {
      await _authService.register(username, email, phone, password);
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setLoading(false);
      return false;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    if (value) _errorMessage = null; // تصفير رسالة الخطأ عند البدء
    notifyListeners();
  }
}