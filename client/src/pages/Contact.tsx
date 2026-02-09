import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function Contact() {
    const [formSubmitted, setFormSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Integrate with email service (e.g., FormSpree, SendGrid)
        setFormSubmitted(true);
    };

    return (
        <Layout>
            <section className="py-24 bg-background">
                <div className="container max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Get in Touch</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Have questions about traveling to Thailand? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div className="bg-card border border-border p-8">
                            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                            {formSubmitted ? (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                                    <p className="text-green-700">
                                        Thank you for contacting us. We'll get back to you within 24-48 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input placeholder="John" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input placeholder="Doe" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input type="email" placeholder="john@example.com" required />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject</label>
                                        <Input placeholder="How can we help you?" required />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Message</label>
                                        <Textarea
                                            placeholder="Tell us about your travel plans or questions..."
                                            rows={5}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full h-12 font-mono uppercase tracking-wider">
                                        Send Message
                                    </Button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    We're here to help you plan your perfect Thailand adventure.
                                    Reach out with any questions about destinations, bookings, or travel tips.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Email</h3>
                                        <p className="text-muted-foreground">hello@gotravelasia.com</p>
                                        <p className="text-sm text-muted-foreground mt-1">We respond within 24-48 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1">Based in</h3>
                                        <p className="text-muted-foreground">Southeast Asia</p>
                                        <p className="text-sm text-muted-foreground mt-1">Helping travelers explore Thailand</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-8">
                                <h3 className="font-bold mb-4">Follow Us</h3>
                                <div className="flex gap-4">
                                    <a
                                        href="https://facebook.com/gotravelasia"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="https://instagram.com/gotravelasia"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="https://twitter.com/gotravelasia"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-muted flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            <div className="bg-muted/50 border border-border p-6">
                                <h3 className="font-bold mb-2">Travel Emergency?</h3>
                                <p className="text-sm text-muted-foreground">
                                    For urgent travel assistance while in Thailand, contact your hotel,
                                    your country's embassy, or the Tourist Police Hotline: <strong>1155</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
