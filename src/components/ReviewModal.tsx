import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { reviewService } from '../services/api';
import { Appointment, Review } from '../types';
import { 
  Star, 
  X, 
  CheckCircle,
  Camera,
  Heart,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onReviewSubmit: (review: Review) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onReviewSubmit
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const preferenceOptions = [
    { id: 'friendly', label: 'Personal amigable', icon: '😊' },
    { id: 'professional', label: 'Servicio profesional', icon: '👔' },
    { id: 'clean', label: 'Ambiente limpio', icon: '✨' },
    { id: 'punctual', label: 'Puntualidad', icon: '⏰' },
    { id: 'quality', label: 'Calidad del servicio', icon: '⭐' },
    { id: 'price', label: 'Precio justo', icon: '💰' },
    { id: 'location', label: 'Ubicación conveniente', icon: '📍' },
    { id: 'atmosphere', label: 'Ambiente relajante', icon: '🕯️' }
  ];

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handlePreferenceToggle = (preferenceId: string) => {
    setPreferences(prev => 
      prev.includes(preferenceId)
        ? prev.filter(id => id !== preferenceId)
        : [...prev, preferenceId]
    );
  };

  const handleSubmit = async () => {
    if (!appointment || rating === 0) {
      toast({
        title: "Error",
        description: "Por favor selecciona una calificación",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const reviewData = {
        appointmentId: appointment.id,
        rating,
        comment: comment.trim() || undefined,
        preferences: preferences.length > 0 ? preferences : undefined
      };

      const review = await reviewService.createReview(reviewData);

      toast({
        title: "¡Gracias por tu reseña!",
        description: "Tu opinión nos ayuda a mejorar nuestros servicios",
      });

      onReviewSubmit(review);
      onClose();
      
      // Reset form
      setRating(0);
      setComment('');
      setPreferences([]);

    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la reseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Muy malo';
      case 2: return 'Malo';
      case 3: return 'Regular';
      case 4: return 'Bueno';
      case 5: return 'Excelente';
      default: return '';
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Califica tu Experiencia</CardTitle>
              <CardDescription>
                {appointment.services?.name} con {appointment.employees?.firstName} {appointment.employees?.lastName}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">¿Cómo calificarías tu experiencia?</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleRatingClick(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      value <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-lg font-medium text-gray-700">
                  {getRatingText(rating)}
                </span>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentarios (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia..."
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-500">
              {comment.length}/500 caracteres
            </div>
          </div>

          {/* Preferences Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">¿Qué te gustó más? (opcional)</Label>
            <p className="text-sm text-gray-600">
              Selecciona las cosas que más te gustaron de tu experiencia
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {preferenceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handlePreferenceToggle(option.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    preferences.includes(option.id)
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Preferences Display */}
          {preferences.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Seleccionado:</Label>
              <div className="flex flex-wrap gap-2">
                {preferences.map((prefId) => {
                  const option = preferenceOptions.find(opt => opt.id === prefId);
                  return option ? (
                    <Badge key={prefId} variant="secondary" className="text-xs">
                      {option.icon} {option.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
              className="flex-1 bg-pink-600 hover:bg-pink-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enviar Reseña
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>
              Tu reseña nos ayuda a mejorar nuestros servicios y ayuda a otros clientes a tomar decisiones informadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewModal;