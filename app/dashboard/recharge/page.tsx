"use client";

import React, { useState } from "react";
import Image from "next/image";

const RechargePage = () => {
  const [amount, setAmount] = useState("");


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md space-y-5">
        <h1 className="text-2xl font-bold text-center">Recharge Wallet</h1>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">Scan this QR to pay:</p>
          <div className="relative w-56 h-56 mx-auto rounded-xl overflow-hidden border">
            <Image
              src="/qr.avif" // Make sure this is in /public/qr.png
              alt="Payment QR"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <p>Payment will proceed manully</p>
        </div>
        </div>

    </div>
  );
};

export default RechargePage;
