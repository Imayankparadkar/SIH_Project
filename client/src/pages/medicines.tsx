import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Pill, 
  Search, 
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Percent,
  MapPin
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  description: string;
  price: number;
  discountedPrice: number;
  discount: number;
  availability: boolean;
  prescription: boolean;
  manufacturer: string;
  category: string;
  dosage: string;
  packaging: string;
}

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

interface Order {
  id: string;
  medicines: CartItem[];
  totalAmount: number;
  discountAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate: Date;
  estimatedDelivery: Date;
  trackingNumber?: string;
}

export function MedicinesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    loadSampleMedicines();
    loadSampleOrders();
  }, []);

  const loadSampleMedicines = () => {
    const sampleMedicines: Medicine[] = [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        description: 'Pain reliever and fever reducer',
        price: 50,
        discountedPrice: 42,
        discount: 16,
        availability: true,
        prescription: false,
        manufacturer: 'Generic Pharma',
        category: 'Pain Relief',
        dosage: '500mg',
        packaging: '20 tablets'
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        description: 'Antibiotic for bacterial infections',
        price: 150,
        discountedPrice: 135,
        discount: 10,
        availability: true,
        prescription: true,
        manufacturer: 'MediCore',
        category: 'Antibiotics',
        dosage: '250mg',
        packaging: '10 capsules'
      },
      {
        id: '3',
        name: 'Metformin 500mg',
        genericName: 'Metformin HCl',
        description: 'Type 2 diabetes management',
        price: 120,
        discountedPrice: 108,
        discount: 10,
        availability: true,
        prescription: true,
        manufacturer: 'DiabetoCare',
        category: 'Diabetes',
        dosage: '500mg',
        packaging: '30 tablets'
      },
      {
        id: '4',
        name: 'Vitamin D3 1000 IU',
        genericName: 'Cholecalciferol',
        description: 'Vitamin D supplement for bone health',
        price: 200,
        discountedPrice: 160,
        discount: 20,
        availability: true,
        prescription: false,
        manufacturer: 'HealthVit',
        category: 'Vitamins',
        dosage: '1000 IU',
        packaging: '60 capsules'
      },
      {
        id: '5',
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        description: 'Proton pump inhibitor for acid reflux',
        price: 180,
        discountedPrice: 153,
        discount: 15,
        availability: false,
        prescription: true,
        manufacturer: 'GastroMed',
        category: 'Gastroenterology',
        dosage: '20mg',
        packaging: '14 capsules'
      }
    ];
    setMedicines(sampleMedicines);
  };

  const loadSampleOrders = () => {
    const sampleOrders: Order[] = [
      {
        id: 'ORD-001',
        medicines: [
          { medicine: medicines[0], quantity: 2 },
          { medicine: medicines[3], quantity: 1 }
        ],
        totalAmount: 244,
        discountAmount: 36,
        status: 'shipped',
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        trackingNumber: 'TRK123456789'
      }
    ];
    setOrders(sampleOrders);
  };

  const searchMedicines = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/medicines/search?query=${encodeURIComponent(searchQuery)}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMedicines(data.medicines);
      }
    } catch (error) {
      console.error('Error searching medicines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map(item => 
          item.medicine.id === medicine.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(item => item.medicine.id !== medicineId));
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.medicine.id === medicineId 
        ? { ...item, quantity }
        : item
    ));
  };

  const placeOrder = async () => {
    if (cart.length === 0 || !deliveryAddress) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/medicines/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          medicines: cart.map(item => ({
            id: item.medicine.id,
            quantity: item.quantity,
            price: item.medicine.price,
            discountedPrice: item.medicine.discountedPrice
          })),
          deliveryAddress
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newOrder: Order = {
          id: data.orderId,
          medicines: cart,
          totalAmount: data.totalAmount,
          discountAmount: cart.reduce((sum, item) => 
            sum + (item.medicine.price - item.medicine.discountedPrice) * item.quantity, 0),
          status: 'pending',
          orderDate: new Date(),
          estimatedDelivery: data.estimatedDelivery
        };
        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        setDeliveryAddress('');
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.medicine.discountedPrice * item.quantity, 0);
  const originalTotal = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const totalDiscount = originalTotal - cartTotal;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    med.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Medicines & Pharmacy</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Medicine Search and Catalog */}
            <div className="lg:col-span-2 space-y-6">
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Search Medicines
                  </CardTitle>
                  <CardDescription>
                    Find medicines by name, generic name, or category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search for medicines..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchMedicines()}
                    />
                    <Button onClick={searchMedicines} disabled={isLoading}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Medicines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMedicines.map((medicine) => (
                  <Card key={medicine.id} className={`${!medicine.availability ? 'opacity-60' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{medicine.name}</CardTitle>
                          <CardDescription>{medicine.genericName}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={medicine.prescription ? 'destructive' : 'default'}>
                            {medicine.prescription ? 'Rx' : 'OTC'}
                          </Badge>
                          {!medicine.availability && <Badge variant="secondary">Out of Stock</Badge>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{medicine.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosage:</span> {medicine.dosage}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pack:</span> {medicine.packaging}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span> {medicine.category}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mfg:</span> {medicine.manufacturer}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold">₹{medicine.discountedPrice}</span>
                            {medicine.discount > 0 && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">₹{medicine.price}</span>
                                <Badge variant="outline" className="text-green-600">
                                  <Percent className="w-3 h-3 mr-1" />
                                  {medicine.discount}% OFF
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        <Button 
                          onClick={() => addToCart(medicine)}
                          disabled={!medicine.availability}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredMedicines.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No medicines found</h3>
                    <p className="text-muted-foreground">
                      Try searching with different keywords or browse all medicines
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Shopping Cart */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Shopping Cart ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.medicine.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.medicine.name}</p>
                              <p className="text-xs text-muted-foreground">₹{item.medicine.discountedPrice} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm w-8 text-center">{item.quantity}</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateQuantity(item.medicine.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>₹{originalTotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span>-₹{totalDiscount}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>₹{cartTotal}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder="Delivery address..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                        <Button 
                          onClick={placeOrder} 
                          disabled={isLoading || !deliveryAddress}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Package className="w-4 h-4 mr-2 animate-spin" />
                              Placing Order...
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4 mr-2" />
                              Place Order
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No orders yet</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>Ordered: {order.orderDate.toLocaleDateString()}</p>
                          <p>Delivery: {order.estimatedDelivery.toLocaleDateString()}</p>
                          {order.trackingNumber && <p>Track: {order.trackingNumber}</p>}
                        </div>
                        <div className="text-sm">
                          <p>{order.medicines.length} item(s) • ₹{order.totalAmount}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}