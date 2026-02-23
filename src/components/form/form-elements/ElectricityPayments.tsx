/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState, ChangeEvent } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Label from '../Label';
import Input from '../input/InputField';
import Select from '../Select';
import DatePicker from '@/components/form/date-picker';
import { toast } from 'react-hot-toast';

// Payment type options
const paymentTypeOptions = [
    { value: "Rent", label: "Rent" },
    { value: "Electricity", label: "Electricity" },
];

// Paid status options
const paidStatusOptions = [
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Partial", label: "Partially Paid" },
];

// Form data interfaces
interface RentPaymentFormData {
    site_id: number;
    month_year: string;
    monthly_rent: number;
    payment_type: string;
    payment_date: string;
    owner_name: string;
    payment_amount: string;
    utr_number: string;
    paid_status: 'Paid' | 'Unpaid' | 'Partial';
}

interface ElectricityPaymentForm {
    site_id: number;
    month_year: string;
    payment_date: string;
    payment_amount: string;
    paid_status: 'Paid' | 'Unpaid' | 'Partial';
    unit: string;
    electricity_charges: string;
    electricity_consumerno: string;
    payment_type: string;
}

interface RentPaymentFormProps {
    siteId: number;
    owners: Array<{
        id?: number;
        owner_name: string;
        owner_monthly_rent: number;
    }>;
    currentMonthlyRent: number;
}

export default function RentPaymentForm({ siteId, owners, currentMonthlyRent }: RentPaymentFormProps) {
    const [paymentType, setPaymentType] = useState<string>('');
    const [rentImage, setRentImage] = useState<File | null>(null);
    const [electricityImage, setElectricityImage] = useState<File | null>(null);
    // Rent payment form data
    const [rentFormData, setRentFormData] = useState<RentPaymentFormData>({
        site_id: siteId,
        month_year: '',
        monthly_rent: currentMonthlyRent,
        payment_type: 'Rent',
        payment_date: new Date().toISOString().split('T')[0],
        owner_name: '',
        payment_amount: '',
        utr_number: '',
        paid_status: 'Paid'
    });

    // Electricity payment form data
    const [electricityFormData, setElectricityFormData] = useState<ElectricityPaymentForm>({
        site_id: siteId,
        month_year: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_amount: '',
        paid_status: 'Paid',
        unit: '',
        electricity_charges: '',
        electricity_consumerno: '',
        payment_type: 'Electricity'
    });

    const [isLoading, setIsLoading] = useState(false);

    // Handle rent form input changes
    const handleRentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRentFormData({
            ...rentFormData,
            [e.target.name]: e.target.value
        });
    };

    // Handle electricity form input changes
    const handleElectricityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setElectricityFormData({
            ...electricityFormData,
            [e.target.name]: e.target.value
        });
    };

    // Handle select changes for rent form
    const handleRentSelectChange = (name: string, value: string) => {
        setRentFormData({
            ...rentFormData,
            [name]: value
        });
    };

    // Handle select changes for electricity form
    const handleElectricitySelectChange = (name: string, value: string) => {
        setElectricityFormData({
            ...electricityFormData,
            [name]: value
        });
    };

    // Handle image input change
    const handleRentImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setRentImage(e.target.files[0]);
        }
    };
    const handleElectricityImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setElectricityImage(e.target.files[0]);
        }
    };

    // Handle date changes for rent form
    const handleRentDateChange = (name: string, dateObj: Date[] | null) => {
        if (dateObj && dateObj[0]) {
            const formattedDate = new Date(dateObj[0]).toISOString().split('T')[0];
            setRentFormData(prev => ({
                ...prev,
                [name]: formattedDate
            }));
        }
    };

    // Handle date changes for electricity form
    const handleElectricityDateChange = (name: string, dateObj: Date[] | null) => {
        if (dateObj && dateObj[0]) {
            const formattedDate = new Date(dateObj[0]).toISOString().split('T')[0];
            setElectricityFormData(prev => ({
                ...prev,
                [name]: formattedDate
            }));
        }
    };

    // Submit rent payment
    const handleRentSubmit = async () => {
        try {
            if (!rentFormData.site_id || !rentFormData.month_year || !rentFormData.payment_amount || !rentFormData.owner_name) {
                throw new Error('Please fill in all required fields');
            }

            const formData = new FormData();
            Object.entries({
                site_id: rentFormData.site_id,
                month_year: rentFormData.month_year,
                monthly_rent: rentFormData.monthly_rent,
                payment_type: rentFormData.payment_type,
                payment_date: rentFormData.payment_date || new Date().toISOString().split('T')[0],
                owner_name: rentFormData.owner_name,
                payment_amount: rentFormData.payment_amount,
                utr_number: rentFormData.utr_number,
                paid_status: rentFormData.paid_status,
                tenant_id: rentFormData.site_id
            }).forEach(([key, value]) => formData.append(key, String(value)));

            if (rentImage) {
                formData.append('image', rentImage);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rent-payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                switch (response.status) {
                    case 409:
                        throw new Error(`A payment record already exists for ${rentFormData.owner_name} for ${rentFormData.month_year}`);
                    case 404:
                        throw new Error('Owner not found or not associated with this site');
                    case 400:
                        throw new Error(data.message || 'Invalid payment details');
                    default:
                        throw new Error(data.message || 'Something went wrong');
                }
            }

            toast.success(
                `Rent Payment Success! ₹${rentFormData.payment_amount} recorded for ${rentFormData.owner_name} (${rentFormData.month_year})`,
                {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: 'white',
                        fontWeight: '500',
                    }
                }
            );

            setRentFormData(prev => ({
                ...prev,
                payment_amount: '',
                owner_name: '',
                paid_status: 'Paid',
                month_year: '',
                payment_date: new Date().toISOString().split('T')[0],
                utr_number: ''
            }));
            setRentImage(null);

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to record rent payment', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: 'white',
                    fontWeight: '500',
                }
            });
        }
    };

    // Submit electricity payment
    const handleElectricitySubmit = async () => {
        try {
            if (!electricityFormData.site_id || !electricityFormData.month_year || !electricityFormData.payment_amount ||
                !electricityFormData.unit || !electricityFormData.electricity_charges || !electricityFormData.electricity_consumerno) {
                throw new Error('Please fill in all required fields');
            }

            const formData = new FormData();
            Object.entries({
                site_id: electricityFormData.site_id,
                month_year: electricityFormData.month_year.toUpperCase(),
                payment_date: electricityFormData.payment_date,
                payment_amount: electricityFormData.payment_amount,
                paid_status: electricityFormData.paid_status,
                unit: electricityFormData.unit,
                electricity_charges: electricityFormData.electricity_charges,
                electricity_consumerno: electricityFormData.electricity_consumerno,
                payment_type: electricityFormData.payment_type
            }).forEach(([key, value]) => formData.append(key, String(value)));

            if (electricityImage) {
                formData.append('image', electricityImage);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/electricity-payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to record electricity payment');
            }

            toast.success(
                `Electricity Payment Success! ₹${electricityFormData.payment_amount} recorded for ${electricityFormData.month_year}`,
                {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: 'white',
                        fontWeight: '500',
                    }
                }
            );

            setElectricityFormData(prev => ({
                ...prev,
                payment_amount: '',
                unit: '',
                electricity_charges: '',
                electricity_consumerno: '',
                paid_status: 'Paid',
                month_year: '',
                payment_date: new Date().toISOString().split('T')[0]
            }));
            setElectricityImage(null);

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to record electricity payment', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: 'white',
                    fontWeight: '500',
                }
            });
        }
    };

    // Main form submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (paymentType === 'Rent') {
                await handleRentSubmit();
            } else if (paymentType === 'Electricity') {
                await handleElectricitySubmit();
            } else {
                throw new Error('Please select a payment type');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ComponentCard title="Record Payment">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Type Selection */}
                <div>
                    <Label htmlFor="payment_type">Payment Type*</Label>
                    <Select
                        options={paymentTypeOptions}
                        value={paymentType}
                        onChange={(value) => setPaymentType(value)}
                        required
                    />
                </div>

                {/* Rent Payment Form */}
                {paymentType === 'Rent' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="month_year">Payment Month*</Label>
                            <Input
                                type="text"
                                id="month_year"
                                name="month_year"
                                value={rentFormData.month_year}
                                onChange={handleRentInputChange}
                                placeholder="e.g., JUNE 2025"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="owner_name">Owner Name*</Label>
                            <Select
                                options={owners.map(owner => ({
                                    value: owner.owner_name,
                                    label: `${owner.owner_name} (₹${owner.owner_monthly_rent || 0})`
                                }))}
                                value={rentFormData.owner_name}
                                onChange={(value) => {
                                    const selectedOwner = owners.find(o => o.owner_name === value);
                                    setRentFormData(prev => ({
                                        ...prev,
                                        owner_name: value,
                                        payment_amount: selectedOwner?.owner_monthly_rent?.toString() || '',
                                        monthly_rent: selectedOwner?.owner_monthly_rent || 0
                                    }));
                                }}
                            />
                        </div>

                        <div>
                            <Label htmlFor="payment_amount">Payment Amount*</Label>
                            <Input
                                type="number"
                                step={0.01}
                                id="payment_amount"
                                name="payment_amount"
                                value={rentFormData.payment_amount}
                                onChange={handleRentInputChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="image">Upload Payment Proof/Image</Label>
                            <div className="flex items-center space-x-3">
                                <label
                                    htmlFor="image"
                                    className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100 transition"
                                >
                                    Choose File
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleRentImageChange}
                                        className="hidden"
                                    />
                                </label>
                                {rentImage && (
                                    <span className="text-xs text-green-600 truncate max-w-xs">
                                        Selected: {rentImage.name}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Accepted formats: JPG, PNG, GIF, etc.</p>
                        </div>
                        <div>
                            <Label htmlFor="utr_number">UTR No.*</Label>
                            <Input
                                type="text"
                                id="utr_number"
                                name="utr_number"
                                value={rentFormData.utr_number}
                                onChange={handleRentInputChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="payment_date">Payment Date</Label>
                            <DatePicker
                                id="payment_date"
                                value={new Date(rentFormData.payment_date)}
                                onChange={(date) => handleRentDateChange('payment_date', date)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="paid_status">Payment Status</Label>
                            <Select
                                options={paidStatusOptions}
                                value={rentFormData.paid_status}
                                onChange={(value) => handleRentSelectChange('paid_status', value)}
                            />
                        </div>
                    </div>
                )}

                {/* Electricity Payment Form */}
                {paymentType === 'Electricity' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="month_year_electricity">Payment Month*</Label>
                            <Input
                                type="text"
                                id="month_year_electricity"
                                name="month_year"
                                value={electricityFormData.month_year}
                                onChange={handleElectricityInputChange}
                                placeholder="e.g., JUNE 2025"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="electricity_consumerno">Consumer Number*</Label>
                            <Input
                                type="text"
                                id="electricity_consumerno"
                                name="electricity_consumerno"
                                value={electricityFormData.electricity_consumerno}
                                onChange={handleElectricityInputChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="unit">Units Consumed*</Label>
                            <Input
                                type="number"
                                step={0.01}
                                id="unit"
                                name="unit"
                                value={electricityFormData.unit}
                                onChange={handleElectricityInputChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="electricity_charges">Electricity Charges*</Label>
                            <Input
                                type="number"
                                step={0.01}
                                id="electricity_charges"
                                name="electricity_charges"
                                value={electricityFormData.electricity_charges}
                                onChange={handleElectricityInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="image">Upload Payment Proof/Image</Label>
                            <div className="flex items-center space-x-3">
                                <label
                                    htmlFor="image"
                                    className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100 transition"
                                >
                                    Choose File
                                    <input
                                        type="file"
                                        id="image"
                                        name="image"
                                        accept="image/*"
                                        onChange={handleElectricityImageChange}
                                        className="hidden"
                                    />
                                </label>
                                {electricityImage && (
                                    <span className="text-xs text-green-600 truncate max-w-xs">
                                        Selected: {electricityImage.name}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Accepted formats: JPG, PNG, GIF, etc.</p>
                        </div>

                        <div>
                            <Label htmlFor="payment_amount_electricity">Payment Amount*</Label>
                            <Input
                                type="number"
                                step={0.01}
                                id="payment_amount_electricity"
                                name="payment_amount"
                                value={electricityFormData.payment_amount}
                                onChange={handleElectricityInputChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="payment_date_electricity">Payment Date</Label>
                            <DatePicker
                                id="payment_date_electricity"
                                value={new Date(electricityFormData.payment_date)}
                                onChange={(date) => handleElectricityDateChange('payment_date', date)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="paid_status_electricity">Payment Status</Label>
                            <Select
                                options={paidStatusOptions}
                                value={electricityFormData.paid_status}
                                onChange={(value) => handleElectricitySelectChange('paid_status', value)}
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        onClick={() => {
                            setPaymentType('');
                            // Reset both forms
                            setRentFormData(prev => ({
                                ...prev,
                                payment_amount: '',
                                owner_name: '',
                                paid_status: 'Paid',
                                month_year: '',
                                payment_date: new Date().toISOString().split('T')[0],
                                utr_number: ''
                            }));
                            setElectricityFormData(prev => ({
                                ...prev,
                                payment_amount: '',
                                unit: '',
                                electricity_charges: '',
                                electricity_consumerno: '',
                                paid_status: 'Paid',
                                month_year: '',
                                payment_date: new Date().toISOString().split('T')[0]
                            }));
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={isLoading || !paymentType}
                    >
                        {isLoading ? 'Recording Payment...' : 'Record Payment'}
                    </button>
                </div>
            </form>
        </ComponentCard>
    );
}

