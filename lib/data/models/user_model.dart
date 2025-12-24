class UserModel {
  final int id;
  final String username;
  final String email;
  final String? phone;
  final String role;
  final String? token; // لتخزين التوكن عند تسجيل الدخول

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.phone,
    required this.role,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['id'] ?? 0,
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone_number'],
      role: json['role'] ?? 'client',
      token: token,
    );
  }
}