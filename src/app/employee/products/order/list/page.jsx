import Link from "next/link";

export default function Orders() {
  return (
    <div className="space-y-4">
      <div className="font-poppins">
        <h1 className="text-3xl font-bold text-[#2B5658]">Order Barang</h1>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <select className="px-3 py-2 border-2 border-[#3F7F83] rounded-lg text-gray-700">
            <option value="5">5 rows</option>
            <option value="10">10 rows</option>
            <option value="20">20 rows</option>
          </select>
        </div>

        <div className="flex space-x-2 items-center">
          <input
            type="text"
            placeholder="Cari Order..."
            className="w-[200px] px-4 py-2 border-2 text-gray-700 border-[#3F7F83] rounded-lg placeholder-gray-500"
          />
          <Link href="/employee/products/order/add">
            <button className="w-[150px] px-4 py-2 border bg-[#3F7F83] text-white rounded-lg hover:bg-[#4F969A] transition">
              Tambah Order
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <table className="min-w-full table-auto text-sm text-left bg-white rounded-2xl shadow-sm overflow-x-auto">
          <thead>
            <tr className="bg-[#3F7F83] text-white">
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2 text-center">Total Products</th>
              <th className="px-4 py-2 text-center">Date</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b bg-gray-50 hover:bg-gray-100">
              <td className="px-4 py-2 text-gray-700">ORD001</td>
              <td className="px-4 py-2 text-gray-700">EMP123</td>
              <td className="px-4 py-2 text-center text-gray-700">12</td>
              <td className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">
                2025-05-01
              </td>
              <td className="px-4 py-2 text-center text-gray-700">
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <button className="px-3 py-1 text-sm bg-[#3F7F83] text-white rounded hover:bg-[#4F969A] transition">
                  Detail
                </button>
              </td>
            </tr>

            <tr className="border-b bg-white hover:bg-gray-100">
              <td className="px-4 py-2 text-gray-700">ORD002</td>
              <td className="px-4 py-2 text-gray-700">EMP124</td>
              <td className="px-4 py-2 text-center text-gray-700">8</td>
              <td className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">
                2025-05-03
              </td>
              <td className="px-4 py-2 text-center text-gray-700">
                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <button className="px-3 py-1 text-sm bg-[#3F7F83] text-white rounded hover:bg-[#4F969A] transition">
                  Detail
                </button>
              </td>
            </tr>

            <tr className="border-b bg-gray-50 hover:bg-gray-100">
              <td className="px-4 py-2 text-gray-700">ORD003</td>
              <td className="px-4 py-2 text-gray-700">EMP125</td>
              <td className="px-4 py-2 text-center text-gray-700">5</td>
              <td className="px-4 py-2 text-center text-gray-700 whitespace-nowrap">
                2025-05-04
              </td>
              <td className="px-4 py-2 text-center text-gray-700">
                <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Canceled
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <button className="px-3 py-1 text-sm bg-[#3F7F83] text-white rounded hover:bg-[#4F969A] transition">
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-center px-2">
          <button className="px-4 py-2 bg-[#3F7F83] text-white rounded-lg hover:bg-[#4F969A] transition">
            Previous
          </button>
          <button className="px-4 py-2 bg-[#3F7F83] text-white rounded-lg hover:bg-[#4F969A] transition">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
