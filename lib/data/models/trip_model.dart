class TripModel {
  final int id;
  final String title;
  final String description;
  final double price;
  final String imageUrl;
  final String location;

  TripModel({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.location,
  });

  factory TripModel.fromJson(Map<String, dynamic> json) {
    return TripModel(
      id: json['id'],
      title: json['title'],
      description: json['description'] ?? '',
      // التعامل مع الأرقام سواء جاءت int أو double
      price: double.parse(json['price'].toString()),
      imageUrl: json['image_url'] ?? '',
      location: json['location'] ?? '',
    );
  }
}