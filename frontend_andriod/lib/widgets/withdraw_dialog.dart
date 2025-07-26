import 'package:flutter/material.dart';

class WithdrawDialog extends StatefulWidget {
  final Function(int amount, String phone, String paymentApp) onSubmit;
  const WithdrawDialog({super.key, required this.onSubmit});

  @override
  State<WithdrawDialog> createState() => _WithdrawDialogState();
}

class _WithdrawDialogState extends State<WithdrawDialog> {
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  String _selectedApp = 'GooglePay';

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Withdraw Tokens'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Enter Amount'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Phone Number'),
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _selectedApp,
              items: const [
                DropdownMenuItem(value: 'GooglePay', child: Text('Google Pay')),
                DropdownMenuItem(value: 'PhonePe', child: Text('PhonePe')),
                DropdownMenuItem(value: 'Paytm', child: Text('Paytm')),
              ],
              onChanged: (val) => setState(() => _selectedApp = val ?? 'GooglePay'),
              decoration: const InputDecoration(labelText: 'Select Payment App'),
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
            final phone = _phoneController.text.trim();
            if (amount > 0 && phone.isNotEmpty) {
              widget.onSubmit(amount, phone, _selectedApp);
              Navigator.pop(context);
            }
          },
          child: const Text('Withdraw'),
        ),
      ],
    );
  }
}
