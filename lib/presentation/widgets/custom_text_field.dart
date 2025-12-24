// lib/presentation/widgets/custom_text_field.dart

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/constants/app_colors.dart';

class CustomTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final bool isPassword;
  final TextInputType keyboardType;
  final Widget? suffixIcon; // إضافة جديدة
  final String? Function(String?)? validator; // إضافة جديدة للتحقق

  const CustomTextField({
    super.key,
    required this.controller,
    required this.hint,
    required this.icon,
    this.isPassword = false,
    this.keyboardType = TextInputType.text,
    this.suffixIcon,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField( // تغيير من TextField إلى TextFormField لدعم الـ Validator
      controller: controller,
      obscureText: isPassword,
      keyboardType: keyboardType,
      validator: validator,
      style: TextStyle(fontSize: 14.sp, color: AppColors.textMain),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: AppColors.textGrey, size: 22.sp),
        suffixIcon: suffixIcon,
        hintText: hint,
        hintStyle: TextStyle(color: AppColors.textGrey.withOpacity(0.7), fontSize: 14.sp),
        filled: true,
        fillColor: const Color(0xFFF5F7FA), // لون رمادي فاتح جداً وعصري
        contentPadding: EdgeInsets.symmetric(vertical: 16.h, horizontal: 20.w),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.r), // حواف أكثر انحناءً
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.r),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.r),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16.r),
          borderSide: const BorderSide(color: AppColors.error, width: 1.0),
        ),
      ),
    );
  }
}