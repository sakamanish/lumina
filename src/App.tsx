import React, { useState } from 'react';

interface InvoiceItem {
  id: number;
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  amount: number;
}

function App() {
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    gst: '',
  });

  const [invoiceDetails, setInvoiceDetails] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: '', hsn: '', qty: 0, rate: 0, amount: 0 },
  ]);

  const calculateAmount = (qty: number, rate: number) => {
    return parseFloat((qty * rate).toFixed(2));
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item };
          
          // Convert string values to numbers for numeric fields
          if (field === 'qty' || field === 'rate') {
            const numValue = Math.max(0, parseFloat(value as string) || 0);
            updatedItem[field] = numValue;
            updatedItem.amount = calculateAmount(
              field === 'qty' ? numValue : item.qty,
              field === 'rate' ? numValue : item.rate
            );
          } else {
            updatedItem[field] = value;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const addNewItem = () => {
    setItems(prev => [...prev, { id: prev.length + 1, description: '', hsn: '', qty: 0, rate: 0, amount: 0 }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateGST = () => {
    const total = calculateTotal();
    return total * 0.18; // 18% GST
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateGST();
  };

  const numberToWords = (num: number) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      
      if (n < 10) return ones[n];
      
      if (n < 20) return teens[n - 10];
      
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      }
      
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
    
    // Use let instead of const for mutable variable
    let workingNum = Math.floor(num);
    let result = '';
    
    if (workingNum >= 10000000) {
      result += convertLessThanThousand(Math.floor(workingNum / 10000000)) + ' Crore ';
      workingNum %= 10000000;
    }
    
    if (workingNum >= 100000) {
      result += convertLessThanThousand(Math.floor(workingNum / 100000)) + ' Lakh ';
      workingNum %= 100000;
    }
    
    if (workingNum >= 1000) {
      result += convertLessThanThousand(Math.floor(workingNum / 1000)) + ' Thousand ';
      workingNum %= 1000;
    }
    
    result += convertLessThanThousand(workingNum);
    
    return result.trim() + ' Only';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[210mm] mx-auto bg-white">
        {/* Edit Form */}
        <div className="p-4 mb-8 bg-gray-50 rounded shadow-sm print:hidden">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Customer Details</h3>
              <input
                type="text"
                placeholder="Customer Name"
                className="w-full p-2 border rounded mb-2"
                value={customerDetails.name}
                onChange={e => setCustomerDetails({ ...customerDetails, name: e.target.value })}
              />
              <textarea
                placeholder="Address"
                className="w-full p-2 border rounded mb-2"
                value={customerDetails.address}
                onChange={e => setCustomerDetails({ ...customerDetails, address: e.target.value })}
              />
              <input
                type="text"
                placeholder="GST Number"
                className="w-full p-2 border rounded"
                value={customerDetails.gst}
                onChange={e => setCustomerDetails({ ...customerDetails, gst: e.target.value })}
              />
            </div>
            <div>
              <h3 className="font-medium mb-2">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="PO Number"
                  className="p-2 border rounded"
                  value={invoiceDetails.poNumber}
                  onChange={e => setInvoiceDetails({ ...invoiceDetails, poNumber: e.target.value })}
                />
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={invoiceDetails.poDate}
                  onChange={e => setInvoiceDetails({ ...invoiceDetails, poDate: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Invoice Number"
                  className="p-2 border rounded"
                  value={invoiceDetails.number}
                  onChange={e => setInvoiceDetails({ ...invoiceDetails, number: e.target.value })}
                />
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={invoiceDetails.date}
                  onChange={e => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Items</h3>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-6 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Description"
                  className="p-2 border rounded"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="HSN"
                  className="p-2 border rounded"
                  value={item.hsn}
                  onChange={e => updateItem(item.id, 'hsn', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  className="p-2 border rounded"
                  value={item.qty || ''}
                  onChange={e => updateItem(item.id, 'qty', e.target.value)}
                />
                <input
  type="number"
  placeholder="Rate"
  className="p-2 border rounded"
  value={item.rate || ''}
  onChange={e => updateItem(item.id, 'rate', e.target.value)}
  min="0"
  step="0.01"
/>
                <div className="p-2 border rounded bg-gray-50">
                  ₹{item.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addNewItem}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Item
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-4 bg-green-500 text-white px-8 py-2 rounded"
          >
            Generate Invoice
          </button>
        </div>

        {/* Invoice Template - Exactly matching the sample */}
        <div className="p-8 bg-white border-2 border-gray-800">
          {/* Fixed Letterhead */}
          <div className="border-b-2 border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm">
                <div>GST No. 36AALFL3875F1Z0</div>
                <div>Mohan</div>
                <div>Call: 7981945670</div>
                <div>www.luminaenterprise.in</div>
              </div>
              <div className="text-5xl font-bold text-blue-800 text-center flex-grow">
                Lumina
                <div className="text-4xl">Enterprises</div>
              </div>
              <div className="w-24"></div> {/* Spacing for alignment */}
            </div>
            <div className="text-center text-sm mb-4">
              Shop No.2, Father's Model School Plot No-165, Venkateshwara Nagar, Qutbullapur, Medchal 500055
              <div>Phone No. 8121272685 Email ID: mohan@luminaenterprises.in</div>
            </div>
          </div>

          {/* Customer Details and Invoice Info */}
          <div className="grid grid-cols-2 gap-4 mt-4 mb-6 border-2 border-gray-800">
            <div className="p-2">
              <div className="font-bold">TO</div>
              <div>{customerDetails.name}</div>
              <div className="whitespace-pre-line">{customerDetails.address}</div>
              <div>GST: {customerDetails.gst}</div>
            </div>
            <div className="p-2 border-l-2 border-gray-800">
              <div>PO. {invoiceDetails.poNumber}</div>
              <div>Dt. {new Date(invoiceDetails.poDate).toLocaleDateString('en-IN')}</div>
              <div>INVOICE NO: {invoiceDetails.number}</div>
              <div>DATE: {new Date(invoiceDetails.date).toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          {/* Items Table - Exact match to sample */}
          <table className="w-full mb-6 border-2 border-gray-800">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="border-r-2 border-gray-800 p-2 text-left">SL.NO</th>
                <th className="border-r-2 border-gray-800 p-2 text-left">PRODUCT DESCRIPTION</th>
                <th className="border-r-2 border-gray-800 p-2 text-center">HSN</th>
                <th className="border-r-2 border-gray-800 p-2 text-right">Qty</th>
                <th className="border-r-2 border-gray-800 p-2 text-right">Rate/Unit</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-800">
                  <td className="border-r-2 border-gray-800 p-2">{index + 1}</td>
                  <td className="border-r-2 border-gray-800 p-2">{item.description}</td>
                  <td className="border-r-2 border-gray-800 p-2 text-center">{item.hsn}</td>
                  <td className="border-r-2 border-gray-800 p-2 text-right">{item.qty}</td>
                  <td className="border-r-2 border-gray-800 p-2 text-right">Rs {Number(item.rate).toFixed(2)}</td>
                  <td className="p-2 text-right">Rs {item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-800">
                <td colSpan={5} className="p-2 text-right border-r-2 border-gray-800">Add. IGST 18%</td>
                <td className="p-2 text-right">Rs {calculateGST().toFixed(2)}</td>
              </tr>
              <tr className="border-t-2 border-gray-800 font-bold">
                <td colSpan={5} className="p-2 text-right border-r-2 border-gray-800">Total Amount</td>
                <td className="p-2 text-right">Rs {calculateGrandTotal().toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in Words and Bank Details */}
          <div className="border-2 border-gray-800 p-2 mb-4">
            <div className="font-bold">Total Amount in Words:</div>
            <div>{numberToWords(calculateGrandTotal())}</div>
          </div>

          <div className="border-2 border-gray-800 p-2 mb-8">
            <div className="font-bold">Bank Details:</div>
            <div>ICICI BANK A/C NO. 130405002466</div>
            <div>IFSC NO.: ICIC0001304</div>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div>
              <div className="font-bold mb-12">Date & Signature of receiving Authority</div>
            </div>
            <div className="text-right">
              <div className="font-bold mb-2">For Lumina Enterprises</div>
              <div className="mt-8">Authorized Signatory</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;