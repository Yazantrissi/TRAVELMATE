import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../core/constants/app_colors.dart';
import '../../providers/trip_provider.dart';
import '../../providers/auth_provider.dart';
import '../widgets/trip_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // جلب البيانات عند فتح الصفحة
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TripProvider>(context, listen: false).fetchTrips();
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user; // لجلب اسم المستخدم
    final tripProvider = Provider.of<TripProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9F9),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Hello, ${user?.username ?? 'Traveler'}! 👋",
                style: TextStyle(color: AppColors.textGrey, fontSize: 14.sp)),
            Text("Where to next?",
                style: TextStyle(color: AppColors.textMain, fontSize: 20.sp, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          IconButton(onPressed: () {}, icon: Icon(Icons.notifications_none, color: AppColors.textMain)),
        ],
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w),
        child: Column(
          children: [
            // شريط بحث (شكل جمالي فقط حالياً)
            SizedBox(height: 20.h),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 15.w),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15.r),
              ),
              child: TextField(
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: "Search for trips...",
                  icon: Icon(Icons.search, color: AppColors.textGrey),
                ),
              ),
            ),
            SizedBox(height: 20.h),

            // قائمة الرحلات
            Expanded(
              child: tripProvider.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : tripProvider.error != null
                  ? Center(child: Text(tripProvider.error!))
                  : ListView.builder(
                itemCount: tripProvider.trips.length,
                itemBuilder: (context, index) {
                  return TripCard(trip: tripProvider.trips[index]);
                },
              ),
            ),
          ],
        ),
      ),
      // شريط تنقل سفلي بسيط
      bottomNavigationBar: BottomNavigationBar(
        selectedItemColor: AppColors.primary,
        unselectedItemColor: Colors.grey,
        showSelectedLabels: false,
        showUnselectedLabels: false,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
          BottomNavigationBarItem(icon: Icon(Icons.favorite_border), label: "Saved"),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: "Profile"),
        ],
      ),
    );
  }
}