/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, List, ListItem, ListItemText, CircularProgress, Divider, Chip } from '@mui/material';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer: {
    email: string;
    name: string;
    phone: string;
    address: string;
    status?: string; 
  };
  items: OrderItem[];
  createdAt: Date;
  // เพิ่ม status เป็น optional field
  total: number; // Add total property to the Order interface
}

const OrderModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        setUserEmail(user.email);
      } else {
        setError('Please log in to view your orders');
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userEmail) return;

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('customer.email', '==', userEmail));
        const querySnapshot = await getDocs(q);
    
        const ordersData: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
    
          // ตรวจสอบสถานะจาก Firestore และใช้ค่า 'ไม่พบ' หากสถานะไม่มีค่า
          const status = data.status && data.status !== '' ? data.status : 'ไม่พบ';
    
          ordersData.push({
            id: doc.id,
            customer: {
              email: data.customer.email,
              name: data.customer.name,
              phone: data.customer.phone,
              address: data.customer.address,
              status: status,
            },
            
            items: data.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            createdAt: data.createdAt?.toDate() || new Date(),
             // ใช้สถานะที่ตรวจสอบแล้ว
            total: data.items.reduce((total: number, item: any) => total + item.price * item.quantity, 0), // คำนวณราคารวม
          });
        });
    
        // เรียงลำดับตามวันที่ล่าสุด
        ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    
    fetchOrders();
  }, [userEmail]);

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '700px' },
          maxHeight: '80vh',
          bgcolor: 'background.paper',
          padding: 3,
          boxShadow: 24,
          borderRadius: 2,
          overflowY: 'auto',
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Your Order History
        </Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {!loading && orders.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
            No orders found for your account.
          </Typography>
        )}

        {orders.map((order) => (
          <Box key={order.id} sx={{ mb: 3, border: '1px solid #eee', borderRadius: 2, p: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="subtitle1">
                <strong>Order ID:</strong> {order.id}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Date:</strong> {order.createdAt.toLocaleDateString()}
              </Typography>
            </Box>

            <Typography variant="subtitle1" mb={1}>
              <strong>Status:</strong>
              {/* ใช้สถานะจาก Firestore โดยตรง */}
              <Chip
                label={order.customer.status}
                color={order.customer.status ? 'success' : 'default'} // ใช้สีเขียวถ้ามีสถานะ
                sx={{ ml: 1, fontWeight: 'bold' }}
              />
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" gutterBottom>
              <strong>Items:</strong>
            </Typography>

            <List dense>
              {order.items.map((item, index) => (
                <ListItem key={`${item.id}-${index}`} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={`${item.name} (x${item.quantity})`}
                    secondary={`$${item.price.toFixed(2)} each`}
                  />
                  <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />

            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1">
                <strong>Shipping to:</strong> {order.customer.address}
              </Typography>
              <Typography variant="h6">
                <strong>Total:</strong> ${calculateTotal(order.items).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        ))}

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default OrderModal;
