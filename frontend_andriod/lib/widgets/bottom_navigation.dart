import 'package:flutter/material.dart';
import 'package:curved_navigation_bar/curved_navigation_bar.dart';
import '../constants/colors.dart';

class BottomNavigation extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const BottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Get the bottom padding to ensure we avoid the navigation bar
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return CurvedNavigationBar(
      backgroundColor: Colors.transparent,
      color: AppColors.primary,
      buttonBackgroundColor: const Color.fromARGB(255, 191, 112, 32),
      height: 60 + (bottomPadding / 2), // Adjust for bottom safe area
      animationDuration: const Duration(milliseconds: 300),
      index: currentIndex,
      items: const <Widget>[
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.home, size: 26, color: Colors.white),
            SizedBox(height: 2),
            Text('Home', style: TextStyle(fontSize: 10, color: Colors.white70)),
          ],
        ),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.format_list_numbered, size: 26, color: Colors.white),
            SizedBox(height: 2),
            Text(
              'Results',
              style: TextStyle(fontSize: 10, color: Colors.white70),
            ),
          ],
        ),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 26, color: Colors.white),
            SizedBox(height: 2),
            Text(
              'History',
              style: TextStyle(fontSize: 10, color: Colors.white70),
            ),
          ],
        ),
        Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.person, size: 26, color: Colors.white),
            SizedBox(height: 2),
            Text(
              'Profile',
              style: TextStyle(fontSize: 10, color: Colors.white70),
            ),
          ],
        ),
      ],
      onTap: onTap,
    );
  }
}
