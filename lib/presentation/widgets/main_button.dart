import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/constants/app_colors.dart';

class MainButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const MainButton({super.key, required this.text, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 50.h,
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.secondary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
          elevation: 0,
        ),
        child: Text(
          text,
          style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }
}