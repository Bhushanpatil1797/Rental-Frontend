"use client";
import React, { useState } from 'react';
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

// Add proper typing for form data
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

interface RentPaymentFormProps {
    siteId: number;
    owners: Array<{
        id?: number;
        owner_name: string;
        owner_monthly_rent: number; // Changed to be non-optional and explicitly number
    }>;
    currentMonthlyRent: number;
}

export default function RentPaymentForm({ siteId, owners, currentMonthlyRent }: RentPaymentFormProps) {
    const [formData, setFormData] = useState<RentPaymentFormData>({
        site_id: siteId,
        month_year: '',
        monthly_rent: currentMonthlyRent,
        payment_type: '',
        payment_date: new Date().toISOString().split('T')[0],
        owner_name: '',
        payment_amount: '',
        utr_number: '',
        paid_status: 'Paid'
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleDateChange = (name: string, dateObj: Date[] | null) => {
        if (dateObj && dateObj[0]) {
            // Ensure it's a local date in YYYY-MM-DD format
            const d = dateObj[0];
            const formattedDate = [
                d.getFullYear(),
                String(d.getMonth() + 1).padStart(2, '0'),
                String(d.getDate()).padStart(2, '0')
            ].join('-');
            setFormData(prev => ({
                ...prev,
                [name]: formattedDate
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate required fields
            if (
                !formData.site_id ||
                !formData.month_year ||
                !formData.payment_amount ||
                !formData.owner_name ||
                !formData.payment_type
            ) {
                throw new Error('Please fill in all required fields');
            }

            // Use FormData for file upload
            const form = new FormData();
            form.append('site_id', String(formData.site_id));
            form.append('month_year', formData.month_year);
            form.append('monthly_rent', String(formData.monthly_rent));
            form.append('payment_type', formData.payment_type);
            form.append('payment_date', formData.payment_date || new Date().toISOString().split('T')[0]);
            form.append('owner_name', formData.owner_name);
            form.append('payment_amount', formData.payment_amount);
            form.append('utr_number', formData.utr_number);
            form.append('paid_status', formData.paid_status);
            if (imageFile) {
                form.append('image', imageFile);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rent-payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                    // Do NOT set Content-Type for FormData, browser will set it
                },
                body: form
            });

            const data = await response.json();

            if (!response.ok) {
                switch (response.status) {
                    case 409:
                        const errorMessage = `A payment record already exists for ${formData.owner_name} for ${formData.month_year}`;
                        throw new Error(errorMessage);
                    case 404:
                        throw new Error('Owner not found or not associated with this site');
                    case 400:
                        throw new Error(data.message || 'Invalid payment details');
                    default:
                        throw new Error(data.message || 'Something went wrong');
                }
            }

            // Enhanced success toast with more details
            const monthYear = new Date(formData.month_year).toLocaleString('default', {
                month: 'long',
                year: 'numeric'
            });

            toast.success(
                `Payment Success! ₹${formData.payment_amount} recorded for ${formData.owner_name} (${monthYear})`,
                {
                    duration: 4000,
                    position: 'top-center',
                    style: {
                        background: '#10B981',
                        color: 'white',
                        fontWeight: '500',
                    },
                    iconTheme: {
                        primary: '#ffffff',
                        secondary: '#10B981',
                    },
                }
            );

            // Reset form while keeping site_id and monthly_rent
            setFormData(prev => ({
                ...prev,
                payment_type: '',
                payment_amount: '',
                owner_name: '',
                paid_status: 'Paid',
                month_year: '',
                payment_date: new Date().toISOString().split('T')[0],
                utr_number: ''
            }));
            setImageFile(null);

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to record payment', {
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#EF4444',
                    color: 'white',
                    fontWeight: '500',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ComponentCard title="Record Rent Payment">
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="month_year">Payment Month*</Label>
                        <Input
                            type="text"
                            id="month_year"
                            name="month_year"
                            value={formData.month_year}
                            onChange={handleInputChange}
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
                            value={formData.owner_name}
                            onChange={(value) => {
                                const selectedOwner = owners.find(o => o.owner_name === value);
                                setFormData(prev => ({
                                    ...prev,
                                    owner_name: value,
                                    // Update both payment_amount and monthly_rent when owner changes
                                    payment_amount: selectedOwner?.owner_monthly_rent?.toString() || '',
                                    monthly_rent: selectedOwner?.owner_monthly_rent || 0 // Add this line
                                }));
                            }}
                        />
                    </div>

                    <div>
                        <Label htmlFor="payment_amount">Payment Amount*</Label>
                        <Input
                            type="number"
                            id="payment_amount"
                            name="payment_amount"
                            value={formData.payment_amount}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="payment_amount">UTR No.*</Label>
                        <Input
                            type="text"
                            id="utr_number"
                            name="utr_number"
                            value={formData.utr_number}
                            onChange={handleInputChange}
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
                                    accept="image/*,.pdf"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {imageFile && (
                                <span className="text-xs text-green-600 truncate max-w-xs">
                                    Selected: {imageFile.name}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Accepted formats: JPG, PNG, GIF, etc.</p>
                    </div>

                    <div>
                        <Label htmlFor="payment_type">Payment Type*</Label>
                        <Select
                            options={paymentTypeOptions}
                            value={formData.payment_type}
                            onChange={(value) => handleSelectChange('payment_type', value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="payment_date">Payment Date</Label>
                        <DatePicker
                            id="payment_date"
                            value={new Date(formData.payment_date)}
                            onChange={(date) => handleDateChange('payment_date', date)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="paid_status">Payment Status</Label>
                        <Select
                            options={paidStatusOptions}
                            value={formData.paid_status}
                            onChange={(value) => handleSelectChange('paid_status', value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Recording Payment...' : 'Record Payment'}
                    </button>
                </div>
            </form>
        </ComponentCard>
    );
}