import React, { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddTaskIcon from '@mui/icons-material/AddTask';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const PRIORITY_COLORS = { High: 'error', Medium: 'warning', Low: 'success' };
const SORT_OPTIONS = { dueDate: 'Due Date', priority: 'Priority' };
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2, null: 3, undefined: 3 };

function TaskDialog({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [priority, setPriority] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setDueDate(initial?.due_date ? dayjs(initial.due_date) : null);
      setPriority(initial?.priority ?? '');
      setNameError('');
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError('Task name is required');
      return;
    }
    onSave({ name: name.trim(), due_date: dueDate ? dueDate.format('YYYY-MM-DD') : null, priority: priority || null });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initial ? 'Edit Task' : 'Add Task'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          autoFocus
          label="Task name"
          variant="outlined"
          value={name}
          onChange={e => { setName(e.target.value); setNameError(''); }}
          error={!!nameError}
          helperText={nameError}
          fullWidth
        />
        <DatePicker
          label="Due date (optional)"
          value={dueDate}
          onChange={setDueDate}
          slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
        />
        <FormControl fullWidth variant="outlined">
          <InputLabel>Priority (optional)</InputLabel>
          <Select value={priority} onChange={e => setPriority(e.target.value)} label="Priority (optional)">
            <MenuItem value="">None</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sortBy, setSortBy] = useState('dueDate');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976D2', dark: '#115293' },
      secondary: { main: '#9C27B0' },
      background: darkMode ? { default: '#121212', paper: '#1E1E1E' } : { default: '#F5F5F5', paper: '#FFFFFF' },
    },
    typography: { fontFamily: 'Roboto, sans-serif' },
  }), [darkMode]);

  const toggleDark = () => {
    setDarkMode(prev => { localStorage.setItem('darkMode', !prev); return !prev; });
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Failed to fetch');
      setTodos(await res.json());
    } catch {
      showSnackbar('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = async (data) => {
    try {
      const isEdit = !!editTarget;
      const url = isEdit ? `/api/todos/${editTarget.id}` : '/api/todos';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setTodos(prev => isEdit ? prev.map(t => t.id === saved.id ? saved : t) : [...prev, saved]);
      setDialogOpen(false);
      setEditTarget(null);
      showSnackbar(isEdit ? 'Task updated' : 'Task created');
    } catch {
      showSnackbar(editTarget ? 'Failed to update task' : 'Failed to create task', 'error');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}/complete`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch {
      showSnackbar('Failed to update task', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setTodos(prev => prev.filter(t => t.id !== id));
      showSnackbar('Task deleted');
    } catch {
      showSnackbar('Failed to delete task', 'error');
    }
  };

  const openEdit = (todo) => { setEditTarget(todo); setDialogOpen(true); };
  const openAdd = () => { setEditTarget(null); setDialogOpen(true); };

  const displayed = useMemo(() => {
    let list = [...todos];
    if (filter === 'incomplete') list = list.filter(t => !t.completed);
    if (filter === 'complete') list = list.filter(t => t.completed);
    list.sort((a, b) => {
      if (sortBy === 'priority') return (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
    return list;
  }, [todos, sortBy, filter]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                TODO App
              </Typography>
              <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
                <IconButton color="inherit" onClick={toggleDark} aria-label="toggle dark mode">
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            </Toolbar>
          </AppBar>

          <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* Controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Sort by</InputLabel>
                <Select value={sortBy} onChange={e => setSortBy(e.target.value)} label="Sort by">
                  {Object.entries(SORT_OPTIONS).map(([v, l]) => (
                    <MenuItem key={v} value={v}>{l}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small" aria-label="filter tasks">
                <ToggleButton value="all" aria-label="show all">All</ToggleButton>
                <ToggleButton value="incomplete" aria-label="show incomplete">Incomplete</ToggleButton>
                <ToggleButton value="complete" aria-label="show complete">Complete</ToggleButton>
              </ToggleButtonGroup>
              <Button variant="contained" startIcon={<AddTaskIcon />} onClick={openAdd} sx={{ ml: 'auto' }}>
                Add Task
              </Button>
            </Box>

            {/* Task list */}
            <Paper elevation={2}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress aria-label="Loading tasks" />
                </Box>
              ) : displayed.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, color: 'text.secondary' }}>
                  <AddTaskIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body1">No tasks yet. Add one above!</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {displayed.map((todo, idx) => (
                    <ListItem
                      key={todo.id}
                      divider={idx < displayed.length - 1}
                      sx={{ px: 2, py: 1 }}
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            aria-label={`edit ${todo.name}`}
                            onClick={() => openEdit(todo)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label={`delete ${todo.name}`}
                            onClick={() => handleDelete(todo.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          checked={!!todo.completed}
                          onChange={() => handleToggleComplete(todo)}
                          inputProps={{ 'aria-label': `mark ${todo.name} complete` }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={todo.completed ? { textDecoration: 'line-through', color: 'text.secondary' } : {}}
                          >
                            {todo.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                            {todo.due_date && (
                              <Typography variant="body2" color="text.secondary">
                                Due: {dayjs(todo.due_date).format('MMM D, YYYY')}
                              </Typography>
                            )}
                            {todo.priority && (
                              <Chip
                                label={todo.priority}
                                color={PRIORITY_COLORS[todo.priority]}
                                size="small"
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Container>

          <TaskDialog
            open={dialogOpen}
            onClose={() => { setDialogOpen(false); setEditTarget(null); }}
            onSave={handleAddOrEdit}
            initial={editTarget}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar(s => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;