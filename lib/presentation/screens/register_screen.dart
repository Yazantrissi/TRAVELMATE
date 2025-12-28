import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/main_button.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final userController = TextEditingController();
  final emailController = TextEditingController();
  final phoneController = TextEditingController();
  final passController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.textMain),
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24.w),
        child: SingleChildScrollView(
          child: Column(
            children: [
              SizedBox(height: 20.h),
              Text(
                "Create Account",
                style: TextStyle(fontSize: 24.sp, fontWeight: FontWeight.bold, color: AppColors.textMain),
              ),
              SizedBox(height: 30.h),

              CustomTextField(controller: userController, hint: "Username", icon: Icons.person_outline),
              CustomTextField(controller: emailController, hint: "Email", icon: Icons.email_outlined),
              CustomTextField(controller: phoneController, hint: "Phone Number", icon: Icons.phone_android),
              CustomTextField(controller: passController, hint: "Password", icon: Icons.lock_outline, isPassword: true),

              SizedBox(height: 30.h),

              authProvider.isLoading
                  ? const CircularProgressIndicator(color: AppColors.primary)
                  : MainButton(
                text: "Sign Up",
                onPressed: () async {
                  bool success = await authProvider.register(
                    userController.text.trim(),
                    emailController.text.trim(),
                    phoneController.text.trim(),
                    passController.text.trim(),
                  );

                  if (success && context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("تم إنشاء الحساب بنجاح! الرجاء تسجيل الدخول.")),
                    );
                    Navigator.pop(context); // العودة لشاشة تسجيل الدخول
                  } else if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(authProvider.errorMessage ?? "Error"),
                        backgroundColor: AppColors.error,
                      ),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}