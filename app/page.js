
'use client'
import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { GitHub, LinkedIn } from '@mui/icons-material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#f5f5f5',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const inventoryItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const inventoryCountStyle = {
  fontWeight: 'bold',
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const addItem = async (item, quantity, expiry) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    const validExpiry = expiry || '';
    const numericQuantity = Number(quantity); // Convert quantity to a number

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      const newCount = count + numericQuantity;
      await setDoc(docRef, { count: newCount, expiry: validExpiry });
    } else {
      await setDoc(docRef, { count: numericQuantity, expiry: validExpiry });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count, expiry } = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, { count: count - 1, expiry });
      } else {
        await deleteDoc(docRef);
      }
    }
    await updateInventory();
  };

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={3}
      bgcolor="#f0f0f0"
      padding={3}
      position="relative"
    >
      <Typography
        variant="h3"
        sx={{
          color: '#1E88E5',
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 2,
        }}
      >
        Sustainable Fridge
      </Typography>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ textAlign: 'center', color: '#333333', fontWeight: 'bold' }}>
            Add Item
          </Typography>
          <Stack width="100%" spacing={2} direction="column">
            <TextField
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              label="Quantity"
              type="number"
              variant="outlined"
              fullWidth
              inputProps={{ min: 1 }}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))} // Convert to number here
            />
            <TextField
              label="Expiry Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </Stack>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              addItem(itemName, quantity, expiryDate);
              setItemName('');
              setQuantity(1);
              setExpiryDate('');
              handleClose();
            }}
            sx={{ mt: 2, bgcolor: '#b0bec5', '&:hover': { bgcolor: '#9e9e9e' } }}
          >
            Add
          </Button>
        </Box>
      </Modal>

      <Stack direction="column" spacing={2} alignItems="center">
        <Typography variant="h6" sx={{ color: '#1E88E5', fontWeight: 'bold' }}>
          Track Inventory
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search Item"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: '300px' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              width: '50px',
              height: '50px',
              minWidth: 'auto',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              bgcolor: '#90caf9',
              '&:hover': { bgcolor: '#64b5f6' },
            }}
          >
            <AddIcon sx={{ fontSize: 30, color: '#ffffff' }} />
          </Button>
        </Stack>
      </Stack>

      <Box width="800px" borderRadius="8px" boxShadow="0 4px 8px rgba(0, 0, 0, 0.2)" bgcolor="#ffffff" padding={2} mt={2}>
        <Stack width="100%" height="300px" spacing={2} overflow="auto">
          {filteredInventory.map(({ name, count, expiry }) => (
            <Box
              key={name}
              sx={inventoryItemStyle}
            >
              <Stack direction="column" spacing={1}>
                <Typography variant={'h6'} color={'#333333'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'body1'} color={'#555555'}>
                  {expiry ? `Expiry: ${expiry}` : 'Expiry: N/A'}
                </Typography>
              </Stack>
              <Typography variant={'h5'} sx={inventoryCountStyle} color={'#333333'}>
                {count}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addItem(name, 1, expiry)}
                  sx={{
                    minWidth: 'auto',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    bgcolor: '#e0e0e0',
                    color: '#333333',
                    '&:hover': {
                      bgcolor: '#bdbdbd',
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 24 }} />
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => removeItem(name)}
                  sx={{
                    minWidth: 'auto',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    bgcolor: '#e0e0e0',
                    color: '#333333',
                    '&:hover': {
                      bgcolor: '#bdbdbd',
                    },
                  }}
                >
                  <RemoveIcon sx={{ fontSize: 24 }} />
                </Button>
                <Button
                  sx={{
                    minWidth: 'auto',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    color: '#64b5f6',
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
                  }}
                  onClick={() => deleteItem(name)}
                >
                  <DeleteIcon sx={{ fontSize: 24 }} />
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box
        width="100%"
        position="fixed"
        bottom={0}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor="#90caf9"
        py={2}
        sx={{ color: "white" }}
      >
        <Typography variant="body2" component="span" sx={{ color: "white", mr: 1 }}>
          Raghad Alabdalla © 2024
        </Typography>
        <Link href="https://github.com/raghadala/SustainableFridge" target="_blank" sx={{ color: "white", mx: 1 }}>
          <GitHub sx={{ color: 'white' }} />
        </Link>
        <Link href="https://www.linkedin.com/in/raghadalabdalla/" target="_blank" sx={{ color: "white", mx: 1 }}>
          <LinkedIn sx={{ color: 'white' }} />
        </Link>
      </Box>
    </Box>
  );
}
