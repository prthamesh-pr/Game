import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/colors.dart';
import '../constants/app_constants.dart';
import '../utils/utils.dart';

class BetDialog extends StatefulWidget {
  final String selectedNumber;
  final String gameClass;
  final double walletBalance;
  final Future<void> Function(double) onBetPlaced;
  final String? timeSlot;

  const BetDialog({
    super.key,
    required this.selectedNumber,
    required this.gameClass,
    required this.walletBalance,
    required this.onBetPlaced,
    required this.timeSlot,
  });

  @override
  State<BetDialog> createState() => _BetDialogState();
}

class _BetDialogState extends State<BetDialog> {
  final TextEditingController _amountController = TextEditingController();
  String? _errorText;
  bool _isProcessing = false;

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  void _validateAmount() {
    final text = _amountController.text.trim();
    if (text.isEmpty) {
      setState(() {
        _errorText = 'Please enter an amount';
      });
      return;
    }

    final amount = double.tryParse(text);
    if (amount == null) {
      setState(() {
        _errorText = 'Please enter a valid amount';
      });
      return;
    }

    if (amount < AppConstants.minBetAmount) {
      setState(() {
        _errorText =
            'Minimum bet is ${Utils.formatCurrency(AppConstants.minBetAmount)}';
      });
      return;
    }

    if (amount > AppConstants.maxBetAmount) {
      setState(() {
        _errorText =
            'Maximum bet is ${Utils.formatCurrency(AppConstants.maxBetAmount)}';
      });
      return;
    }

    if (amount > widget.walletBalance) {
      setState(() {
        _errorText = 'Insufficient tokens';
      });
      return;
    }

    setState(() {
      _errorText = null;
    });
  }

  Widget _quickBetButton(int amount) {
    return InkWell(
      onTap: () {
        _amountController.text = amount.toString();
        _validateAmount();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
        ),
        child: Text(
          '$amount Tokens',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Place Your Bet',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Utils.getColorByClass(widget.gameClass),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                children: [
                  const Text(
                    'Selected Number',
                    style: TextStyle(fontSize: 14, color: Colors.white70),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    widget.selectedNumber,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Class ${widget.gameClass}',
                    style: const TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onChanged: (_) => _validateAmount(),
              decoration: InputDecoration(
                labelText: 'Tokens to Bet',
                suffixText: 'Tokens',
                errorText: _errorText,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                hintText: 'Enter token amount',
                filled: true,
                fillColor: Colors.grey[100],
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [_quickBetButton(50), _quickBetButton(100)],
            ),
            const SizedBox(height: 15),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Token Balance:'),
                Text(
                  '${widget.walletBalance.toStringAsFixed(0)} Tokens',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: _isProcessing
                      ? null
                      : () async {
                          _validateAmount();
                          if (_errorText == null) {
                            setState(() {
                              _isProcessing = true;
                            });

                            try {
                              final amount = double.parse(
                                _amountController.text,
                              );
                              await widget.onBetPlaced(amount);

                              if (mounted) {
                                Navigator.pop(context);
                              }
                            } catch (e) {
                              Utils.showToast(
                                'Error placing bet: $e',
                                isError: true,
                              );
                              setState(() {
                                _isProcessing = false;
                              });
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 30,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isProcessing
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 3,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Place Bet',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
