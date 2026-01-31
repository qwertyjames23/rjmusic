"use client";

import { Camera } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
    const [gender, setGender] = useState("male");
    const [day, setDay] = useState("15");
    const [month, setMonth] = useState("June");
    const [year, setYear] = useState("1995");

    return (
        <div className="bg-card w-full rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">My Profile</h2>
                <p className="text-muted-foreground text-sm mt-1">Manage and protect your account</p>
            </div>

            <div className="p-6 lg:p-10 flex flex-col lg:flex-row gap-12">
                {/* Profile Form */}
                <div className="flex-1 max-w-2xl">
                    <form className="space-y-6">
                        {/* Username */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Username</label>
                            <div className="flex-1 text-sm font-medium">alex_music_gear</div>
                        </div>

                        {/* Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Name</label>
                            <div className="flex-1">
                                <input
                                    className="w-full bg-background border border-input rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                    type="text"
                                    defaultValue="Alexander Rivers"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Email</label>
                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm">al********@gmail.com</span>
                                <button className="text-primary hover:underline text-xs font-medium" type="button">Change</button>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Phone Number</label>
                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm">********56</span>
                                <button className="text-primary hover:underline text-xs font-medium" type="button">Change</button>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Gender</label>
                            <div className="flex-1 flex items-center gap-6">
                                {["Male", "Female", "Other"].map((option) => (
                                    <label key={option} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option.toLowerCase()}
                                            checked={gender === option.toLowerCase()}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="text-primary focus:ring-primary/20 border-border bg-transparent"
                                        />
                                        <span className="text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Birthday */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <label className="sm:w-32 text-muted-foreground text-sm sm:text-right">Date of Birth</label>
                            <div className="flex-1 flex gap-3">
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                        <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                                <select
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                >
                                    {Array.from({ length: 100 }, (_, i) => 2024 - i).map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
                            <div className="sm:w-32"></div>
                            <div className="flex-1">
                                <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-10 rounded-lg transition-all shadow-lg shadow-primary/20 active:scale-[0.98]" type="submit">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Avatar Upload */}
                <div className="w-full lg:w-64 flex flex-col items-center gap-6 lg:border-l border-border">
                    <div className="relative group">
                        <div className="size-32 rounded-full overflow-hidden border-4 border-secondary shadow-xl">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDaiUcchYnDw_rY_pOfhGIEWHwlUwYqVcA_JpSOGf47k8bnLwvEDvlU9vqC2tmbcKSv2PCIsaqiV12f-nkFShlRG9ftMkljG2Q8iAlLwf2vQSLtqYCDZBvlWsOor0m08IernYW5BD9e6NVvdG0xwf9CQHr285OgWaimg4RccW8_tN7uKJNi1oV7uydSu_CW4610781d4jIR7YjoiUggY_RmkZYMTyCCPrIBWP1stylPqjjgyExHXuQHGyDr83Mo8lIGHmZcE2JKGw"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white size-8" />
                        </div>
                    </div>
                    <div className="text-center flex flex-col gap-2">
                        <button className="bg-secondary border border-border text-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
                            Select Image
                        </button>
                        <p className="text-muted-foreground text-xs mt-2 leading-relaxed">
                            File size: maximum 1 MB<br />
                            Extension: .JPEG, .PNG
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
