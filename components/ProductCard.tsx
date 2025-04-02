import React, { useState, useEffect } from 'react';
import { Card, CardMedia, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
interface CardType {
  id: string;
  name: string;
  images: {
    large: string;
  };
  tcgplayer: {
    prices?: {
      normal?: { market: number };
    };
  };
}

interface ProductCardProps {
  cardId: string;
  addToCart: (card: CardType) => void;
}
interface ProductCardProps {
  card: CardType;
  addToCart: (card: CardType) => void;
}


const ProductCard: React.FC<ProductCardProps> = ({ cardId, addToCart }) => {
  const [cardData, setCardData] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!cardId) {
        setError('No card ID provided');
        setLoading(false);
        return;
      }

      try {
        // เรียก API เพื่อดึงข้อมูลการ์ดโดยใช้ API Key
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
          headers: { "X-api-key": "bffbe7c7-cf5c-4854-9b63-b51f85a3616c" }
        });

        const card = response.data.data;
        console.log("Fetched card data:", card); 
        const cardInfo: CardType = {
          id: card.id,
          name: card.name,
          images: {
            large: card.images.large
          },
          tcgplayer: {
            prices: card.tcgplayer?.prices 
          }
        };

        setCardData(cardInfo); // เก็บข้อมูลการ์ดใน state
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(`Error: ${error.response.status} - ${error.response.statusText}`);
        } else {
          setError('Failed to load card data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [cardId]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', marginTop: '20px' }} />;
  if (error) return <Alert severity="error" sx={{ margin: '20px auto', width: '80%' }}>{error}</Alert>;
  if (!cardData) return <Alert severity="warning" sx={{ margin: '20px auto', width: '80%' }}>Card not found</Alert>;

  // ตรวจสอบว่ามีราคาหรือไม่ และแสดงผล
  const price = cardData.tcgplayer?.prices?.normal?.market;
  const displayPrice = price !== undefined ? `$${price.toFixed(2)}` : 'Price not available';
  

  return (
    <Card sx={{ maxWidth: 250, backgroundColor: 'transparent', boxShadow: 'none', padding: '0px', position: 'relative', textAlign: 'center' }}>
      <CardMedia
        component="img"
        image={cardData.images.large}
        alt={cardData.name}
        sx={{
          width: '100%',
          height: 140,
          objectFit: 'contain',
          position: 'relative',
          top: 25,
          margin: '0 auto',
          zIndex: 1,
        }}
      />
      <Box sx={{
        position: 'relative',
        backgroundColor: '#0b0c16',
        borderRadius: '16px',
        padding: '1px',
        color: 'white',
        textAlign: 'center',
        marginTop: '1px',
        width: '160px',
        height: '170px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        margin: '0 auto',
      }}>
        <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', marginBottom: '0px', marginTop: "25px" }}>
          {cardData.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'lightgray', marginTop: '0', marginBottom: '2px' }}>
          {displayPrice} {/* แสดงราคาหรือข้อความ "Price not available" */}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          size="small"
          sx={{
            color: 'white',
            marginBottom: '10px',
            backgroundColor: '#4F4F4F',
            opacity: 0.7,
            '&:hover': {
              backgroundColor: '#3333FF',
              opacity: 1,
            },
          }}
          onClick={() => addToCart(cardData)} // ส่ง cardData ไปยัง addToCart
        >
          <LocalMallOutlinedIcon sx={{ marginRight: '8px' }} />
          Add to Cart
        </Button>
      </Box>
    </Card>
  );
};

export default ProductCard;
