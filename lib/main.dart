import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';

// استيراد الـ Providers
import 'providers/auth_provider.dart';
import 'providers/trip_provider.dart';

// استيراد الشاشات
import 'presentation/screens/welcome_screen.dart';
import 'presentation/screens/login_screen.dart';
import 'presentation/screens/home_screen.dart';

void main() {
  // التأكد من تهيئة أدوات Flutter قبل تشغيل التطبيق
  WidgetsFlutterBinding.ensureInitialized();

  // جعل شريط الحالة (Status Bar) شفافاً ليتناسب مع التصميم
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const TravelMateApp());
}

class TravelMateApp extends StatelessWidget {
  const TravelMateApp({super.key});

  @override
  Widget build(BuildContext context) {
    // 1. إعداد الـ Providers للحقن في شجرة التطبيق
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => TripProvider()),
      ],
      // 2. إعداد ScreenUtil للتعامل مع Responsive UI بناءً على مقاسات Figma
      child: ScreenUtilInit(
        designSize: const Size(375, 812), // مقاس شاشة آيفون القياسي في فيجما
        minTextAdapt: true,
        splitScreenMode: true,
        builder: (context, child) {
          return MaterialApp(
            debugShowCheckedModeBanner: false,
            title: 'TravelMate',

            // 3. إعداد الثيم العام للتطبيق (Fonts & Colors)
            theme: ThemeData(
              useMaterial3: true,
              // ضبط الخط الرئيسي للتطبيق ليكون عصرياً ومطابقاً للتصميم
              textTheme: GoogleFonts.poppinsTextTheme(Theme.of(context).textTheme),
              primarySwatch: Colors.blue,
              scaffoldBackgroundColor: Colors.white,
            ),

            // 4. نقطة البداية (Welcome Screen)
            // ملاحظة: يمكنك إضافة منطق هنا للتحقق إذا كان المستخدم مسجلاً دخولاً مسبقاً
            home: const WelcomeScreen(),

            // 5. تعريف الروابط (Routes) للتنقل السهل بين الصفحات
            routes: {
              '/login': (context) => const LoginScreen(),
              '/home': (context) => const HomeScreen(),
            },
          );
        },
      ),
    );
  }
}