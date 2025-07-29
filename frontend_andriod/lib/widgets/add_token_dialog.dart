import 'package:flutter/material.dart';

class AddTokenDialog extends StatefulWidget {
  final String qrImageUrl;
  final Function(int amount, String upiId, String userName, String paymentApp)
  onSubmit;
  const AddTokenDialog({
    super.key,
    required this.qrImageUrl,
    required this.onSubmit,
  });

  @override
  State<AddTokenDialog> createState() => _AddTokenDialogState();
}

class _AddTokenDialogState extends State<AddTokenDialog> {
  final TextEditingController _amountController = TextEditingController();
  // Removed unused UPI and Name controllers
  String _selectedApp = 'GooglePay';

  @override
  Widget build(BuildContext context) {
    final referral =
        'REF12345'; // Mock referral, replace with profile fetch if available
    return AlertDialog(
      title: const Text('Add Tokens'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            widget.qrImageUrl.isNotEmpty
                ? Image.network(widget.qrImageUrl, height: 120)
                : Image.asset('assets/images/app_icon.png', height: 120),
            const SizedBox(height: 12),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Enter Amount (Tokens)',
                suffixText: 'Tokens',
              ),
            ),
            const SizedBox(height: 8),
            // Removed UPI ID and Name fields as per latest requirements
            // Only amount, payment app, referral number are shown
            DropdownButtonFormField<String>(
              value: _selectedApp,
              items: const [
                DropdownMenuItem(value: 'GooglePay', child: Text('Google Pay')),
                DropdownMenuItem(value: 'PhonePe', child: Text('PhonePe')),
                DropdownMenuItem(value: 'Paytm', child: Text('Paytm')),
              ],
              onChanged: (val) =>
                  setState(() => _selectedApp = val ?? 'GooglePay'),
              decoration: const InputDecoration(
                labelText: 'Select Payment App',
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              enabled: false,
              decoration: InputDecoration(
                labelText: 'Referral Number',
                hintText: referral,
                prefixIcon: const Icon(Icons.card_giftcard),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            final amount = int.tryParse(_amountController.text) ?? 0;
            if (amount > 0) {
              widget.onSubmit(amount, '', '', _selectedApp);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Token request submitted!')),
              );
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Please enter a valid amount.')),
              );
            }
          },
          child: const Text('Add Token'),
        ),
      ],
    );
  }
}
