import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  Box,
  Alert,
} from "@mui/material";
import { User } from "firebase/auth";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ModalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (customerData: { 
    name: string; 
    address: string; 
    phone: string;
    email?: string;
  }) => Promise<void>;
  cartItems: CartItem[];
  currentUser: User | null;
  onLoginRequest?: () => void; // เพิ่ม prop สำหรับการขอให้ล็อกอิน
}

const ModalForm: React.FC<ModalFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  cartItems,
  currentUser,
  onLoginRequest 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // ตรวจสอบเมื่อเปิด Modal ว่าผู้ใช้ล็อกอินหรือไม่
  useEffect(() => {
    if (open) {
      setShowLoginAlert(!currentUser);
    }
  }, [open, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleSubmit = async () => {
    // ตรวจสอบการล็อกอินก่อน
    if (!currentUser) {
      setShowLoginAlert(true);
      if (onLoginRequest) {
        onLoginRequest();
      }
      return;
    }

    if (!formData.name || !formData.address || !formData.phone) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        email: currentUser.email ?? undefined, // ใช้ email จากผู้ใช้ที่ล็อกอินเท่านั้น
      });
      setFormData({ name: "", address: "", phone: "" });
      onClose();
    } catch (error) {
      console.error("Error submitting order: ", error);
      alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    if (onLoginRequest) {
      onLoginRequest();
      onClose(); // ปิด Modal สั่งซื้อหลังจากเปิด Modal ล็อกอิน
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>📝 กรอกข้อมูลสำหรับการสั่งซื้อ</DialogTitle>
      <DialogContent>
        {showLoginAlert && (
          <Box mb={2}>
            <Alert severity="warning">
              คุณต้องล็อกอินก่อนจึงจะสั่งซื้อได้ — 
              <Button 
                color="primary" 
                size="small" 
                onClick={handleLoginClick}
                style={{ marginLeft: 8 }}
              >
                ล็อกอินที่นี่
              </Button>
            </Alert>
          </Box>
        )}

        {currentUser ? (
          <>
            <Typography variant="subtitle1" style={{ marginBottom: 10 }}>
              อีเมลผู้ใช้: {currentUser.email}
            </Typography>
            
            <TextField
              fullWidth
              margin="dense"
              label="ชื่อ"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={!currentUser}
            />
            <TextField
              fullWidth
              margin="dense"
              label="ที่อยู่"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={!currentUser}
            />
            <TextField
              fullWidth
              margin="dense"
              label="เบอร์โทร"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={!currentUser}
            />

            <Typography variant="h6" style={{ marginTop: 10 }}>🛒 รายการสินค้า:</Typography>
            <List>
              {cartItems.map((item) => (
                <ListItem key={item.id}>
                  {item.name} - ฿{item.price} x {item.quantity}
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" style={{ marginTop: 10 }}>
              💰 ยอดรวม: ฿{getTotalPrice()}
            </Typography>
          </>
        ) : (
          <Typography variant="body1" style={{ marginTop: 20, textAlign: 'center' }}>
            กรุณาล็อกอินเพื่อดำเนินการสั่งซื้อ
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="error" disabled={isSubmitting}>
          ปิด
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          disabled={isSubmitting || !currentUser}
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalForm;