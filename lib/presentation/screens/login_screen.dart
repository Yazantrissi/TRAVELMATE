import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/main_button.dart';
import 'register_screen.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // تعريف المتحكمات للنصوص
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passController = TextEditingController();

  // مفتاح التحقق من النموذج
  final _formKey = GlobalKey<FormState>();

  // حالة رؤية كلمة المرور
  bool isPasswordVisible = false;

  @override
  void dispose() {
    emailController.dispose();
    passController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // الوصول إلى مزود البيانات (Auth Provider)
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 20.h),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 50.h),

                // --- الجزء العلوي: الشعار والترحيب ---
                Center(
                  child: Container(
                    padding: EdgeInsets.all(20.w),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.travel_explore_rounded,
                      size: 60.sp,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                SizedBox(height: 30.h),
                Text(
                  "Welcome Back! 👋",
                  style: TextStyle(
                    fontSize: 28.sp,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textMain,
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  "Sign in to access your trips and explore more.",
                  style: TextStyle(
                    fontSize: 15.sp,
                    color: AppColors.textGrey,
                  ),
                ),
                SizedBox(height: 40.h),

                // --- حقل البريد الإلكتروني أو الهاتف ---
                Text("Email or Phone Number", style: _labelStyle()),
                SizedBox(height: 8.h),
                CustomTextField(
                  controller: emailController,
                  hint: "Enter your email or phone",
                  icon: Icons.person_outline_rounded,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return "This field is required";
                    }
                    return null;
                  },
                ),

                SizedBox(height: 20.h),

                // --- حقل كلمة المرور ---
                Text("Password", style: _labelStyle()),
                SizedBox(height: 8.h),
                CustomTextField(
                  controller: passController,
                  hint: "Enter your password",
                  icon: Icons.lock_outline_rounded,
                  isPassword: !isPasswordVisible,
                  // إضافة أيقونة العين لإظهار كلمة المرور
                  suffixIcon: IconButton(
                    icon: Icon(
                      isPasswordVisible ? Icons.visibility : Icons.visibility_off,
                      color: AppColors.textGrey,
                      size: 20.sp,
                    ),
                    onPressed: () {
                      setState(() {
                        isPasswordVisible = !isPasswordVisible;
                      });
                    },
                  ),
                  validator: (value) {
                    if (value == null || value.length < 6) {
                      return "Password must be at least 6 characters";
                    }
                    return null;
                  },
                ),

                // رابط نسيت كلمة المرور
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: Text(
                      "Forgot Password?",
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13.sp,
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 20.h),

                // --- زر تسجيل الدخول ---
                authProvider.isLoading
                    ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                    : MainButton(
                  text: "Login",
                  onPressed: () async {
                    if (_formKey.currentState!.validate()) {
                      // إغلاق الكيبورد
                      FocusScope.of(context).unfocus();

                      // استدعاء دالة تسجيل الدخول من الـ Provider
                      bool success = await authProvider.login(
                        emailController.text.trim(),
                        passController.text.trim(),
                      );

                      if (success && context.mounted) {
                        // في حال النجاح، التوجه للرئيسية وحذف كل ما سبق من الـ Stack
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (_) => const HomeScreen()),
                              (route) => false,
                        );
                      } else if (context.mounted) {
                        // في حال الفشل، إظهار رسالة خطأ
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(authProvider.errorMessage ?? "Login Failed"),
                            backgroundColor: AppColors.error,
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
                    }
                  },
                ),

                SizedBox(height: 30.h),

                // --- الجزء السفلي: رابط إنشاء حساب جديد ---
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: TextStyle(color: AppColors.textGrey, fontSize: 14.sp),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const RegisterScreen()),
                        );
                      },
                      child: Text(
                        "Sign Up",
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 14.sp,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 20.h),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // تنسيق نصوص العناوين الجانبية (Labels)
  TextStyle _labelStyle() {
    return TextStyle(
      fontSize: 14.sp,
      fontWeight: FontWeight.w600,
      color: AppColors.textMain,
    );
  }
}