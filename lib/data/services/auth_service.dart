import 'package:dio/dio.dart';
import '../models/user_model.dart';

class AuthService {
  // 10.0.2.2 هو العنوان الخاص بالـ localhost داخل محاكي الأندرويد
  final Dio _dio = Dio(BaseOptions(
    baseUrl: "http://192.168.1.27:3000/api",
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {'Content-Type': 'application/json'},
  ));

  // تسجيل الدخول
  Future<UserModel> login(String identifier, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        "identifier": identifier,
        "password": password,
      });

      // استخراج البيانات من الرد
      final data = response.data;
      final token = data['token'];
      final userMap = data['user'];

      return UserModel.fromJson(userMap, token: token);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // إنشاء حساب جديد
  Future<void> register(String username, String email, String phone, String password) async {
    try {
      await _dio.post('/auth/register', data: {
        "username": username,
        "email": email,
        "phone_number": phone,
        "password": password,
      });
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // معالجة الأخطاء بشكل بسيط
  String _handleError(DioException e) {
    if (e.response != null) {
      return e.response?.data['message'] ?? 'حدث خطأ غير معروف';
    } else {
      return 'تأكد من اتصالك بالخادم (Server)';
    }
  }
}