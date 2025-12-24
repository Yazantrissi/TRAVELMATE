import 'package:flutter/material.dart';
import '../data/models/trip_model.dart';
import '../data/services/trip_service.dart';

class TripProvider extends ChangeNotifier {
  final TripService _tripService = TripService();

  List<TripModel> _trips = [];
  bool _isLoading = false;
  String? _error;

  List<TripModel> get trips => _trips;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchTrips() async {
    _isLoading = true;
    notifyListeners();

    try {
      _trips = await _tripService.getAllTrips();
      _error = null;
    } catch (e) {
      _error = "Could not fetch trips. Check connection.";
    }

    _isLoading = false;
    notifyListeners();
  }
}