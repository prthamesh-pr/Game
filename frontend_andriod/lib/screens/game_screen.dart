import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/bet_dialog.dart';
import '../utils/utils.dart';
import '../services/game_service.dart';

class GameScreen extends StatefulWidget {
  final String gameClass;

  const GameScreen({super.key, required this.gameClass});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late List<String> _numbers = [];
  final GameService _gameService = GameService();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNumbers();
  }

  Future<void> _loadNumbers() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _gameService.getValidNumbers(widget.gameClass);
      setState(() {
        if (response['data'] != null && response['data']['validNumbers'] != null) {
          List<String> nums = (response['data']['validNumbers'] as List).map((n) => n.toString()).toList();
          if (widget.gameClass == 'D') {
            nums.sort((a, b) => int.parse(a).compareTo(int.parse(b))); // Ascending
          } else {
            nums.sort((a, b) => int.parse(b).compareTo(int.parse(a))); // Descending
          }
          _numbers = nums;
        } else {
          _numbers = [];
        }
      });
    } catch (e) {
      Utils.showToast('Error loading numbers: $e', isError: true);
      _numbers = [];
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Color _getClassColor() {
    return Utils.getColorByClass(widget.gameClass);
  }

  void _showBetDialog(String number) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final gameProvider = Provider.of<GameProvider>(context, listen: false);
    final user = authProvider.currentUser;

    if (user == null) return;

    showDialog(
      context: context,
      builder: (context) => BetDialog(
        selectedNumber: number,
        gameClass: widget.gameClass,
        walletBalance: user.walletBalance,
        onBetPlaced: (amount) async {
          // Place bet
          final success = await gameProvider.placeBet(
            gameClass: widget.gameClass,
            number: number,
            amount: amount,
            authProvider: authProvider,
          );

          if (success) {
            // The wallet balance will be updated by the placeBet method

            if (context.mounted) {
              // Show success message but don't navigate away
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Bet placed successfully!'),
                  backgroundColor: Colors.green,
                ),
              );
            }
          }
        },
      ),
    );
  }

  Widget _buildNumberGrid() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_numbers.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.grey),
            const SizedBox(height: 16),
            Text('No numbers available for Class ${widget.gameClass}'),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _loadNumbers, child: const Text('Retry')),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 1.2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: _numbers.length,
      itemBuilder: (context, index) {
        return _buildNumberTile(_numbers[index], index);
      },
    );
  }

  Widget _buildNumberTile(String number, int index) {
    final baseColor = Utils.getRandomColor(index);

    return InkWell(
      onTap: () => _showBetDialog(number),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              baseColor,
              Color.fromRGBO(
                (baseColor.r * 255.0).round() & 0xff,
                (baseColor.g * 255.0).round() & 0xff,
                (baseColor.b * 255.0).round() & 0xff,
                0.7,
              ),
            ],
          ),
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Color.fromRGBO(
                (baseColor.r * 255.0).round() & 0xff,
                (baseColor.g * 255.0).round() & 0xff,
                (baseColor.b * 255.0).round() & 0xff,
                0.5,
              ),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Center(
          child: Text(
            number,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.currentUser;

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Class ${widget.gameClass} Game',
        walletBalance: user?.walletBalance,
        showWallet: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              // Show game class description
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: Text(
                    'Class ${widget.gameClass} Info',
                    style: TextStyle(color: _getClassColor()),
                  ),
                  content: Text(Utils.getClassDescription(widget.gameClass)),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('OK'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            color: Color.fromRGBO(
              (_getClassColor().r * 255.0).round() & 0xff,
              (_getClassColor().g * 255.0).round() & 0xff,
              (_getClassColor().b * 255.0).round() & 0xff,
              0.1,
            ),
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Text(
              'Select a number to place your bet',
              style: TextStyle(fontSize: 16, color: _getClassColor()),
              textAlign: TextAlign.center,
            ),
          ),
          Expanded(child: _buildNumberGrid()),
        ],
      ),
    );
  }
}
