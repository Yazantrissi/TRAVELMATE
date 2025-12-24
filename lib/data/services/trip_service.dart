import 'package:dio/dio.dart';
import '../../core/constants/app_colors.dart'; // تأكد من المسار
import '../models/trip_model.dart';

class TripService {
  // استخدام نفس عنوان السيرفر
  final Dio _dio = Dio(BaseOptions(baseUrl: "http://10.101.75.210:3000/api"));

  Future<List<TripModel>> getAllTrips() async {
    try {
      final response = await _dio.get('/trips');
      // الـ Backend يرجع مصفوفة JSON
      List<dynamic> data = response.data;
      return data.map((json) => TripModel.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Failed to load trips');
    }
  }
}