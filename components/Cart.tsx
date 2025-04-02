import { useState } from "react";
import {
  Drawer,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Grid,
} from "@mui/material";
import { Close, Add, Remove, Delete } from "@mui/icons-material";
import ModalForm from "./ModalForm";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ open, onClose, cartItems, updateQuantity, removeFromCart, clearCart }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // ฟังก์ชันสำหรับทำการชำระเงินและบันทึกคำสั่งซื้อ
  const handleCheckout = async (customerData: { name: string; address: string; phone: string; userEmail?: string }) => {
    try {
      const orderData = {
        customer: customerData, // customerData จะมี userEmail ที่ถูกส่งมาจาก ModalForm
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        timestamp: new Date(),
      };
      await addDoc(collection(db, "orders"), orderData);
      alert("คำสั่งซื้อสำเร็จ!");
      clearCart();
      setModalOpen(false);
      onClose();
    } catch (error) {
      console.error("Error adding order: ", error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <Box sx={{ width: 400, p: 3, backgroundColor: "#252836" }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Typography variant="h4" color="white">Cart</Typography>
            <IconButton onClick={onClose} color="error">
              <Close />
            </IconButton>
          </Grid>

          {cartItems.length === 0 ? (
            <Typography color="white" sx={{ mt: 2 }}>ตะกร้าว่างเปล่า</Typography>
          ) : (
            <>
              <List>
                {cartItems.map((item) => (
                  <ListItem key={item.id} sx={{ color: "white", display: "flex", alignItems: "center" }}>
                    <ListItemText primary={item.name} secondary={`฿${item.price} x ${item.quantity}`} />
                    <IconButton onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Remove />
                    </IconButton>
                    <Typography>{item.quantity}</Typography>
                    <IconButton onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Add />
                    </IconButton>
                    <IconButton onClick={() => removeFromCart(item.id)} color="error">
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>

              <Typography variant="h6" color="white" sx={{ mt: 2 }}>
                Total: ฿{total}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, backgroundColor: "#EA7C69", '&:hover': { backgroundColor: "#ff4500" } }}
                onClick={() => setModalOpen(true)}
              >
                ดำเนินการชำระเงิน
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Modal สำหรับบันทึกข้อมูลลูกค้า */}
      <ModalForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCheckout}
        cartItems={cartItems}

        currentUser={auth.currentUser}
      />
    </>
  );
};

export default Cart;
