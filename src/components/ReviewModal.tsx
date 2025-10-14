import React, { useState } from 'react';
import { Star, MessageSquare, Palette, Heart } from 'lucide-react';
import Modal from './Modal';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  employeeId: string;
  serviceName: string;
  employeeName: string;
  onReviewSubmit: (review: ReviewData) => void;
}

interface ReviewData {
  rating: number;
  comment?: string;
  hairColorPreference?: string;
  servicePreference?: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  employeeId,
  serviceName,
  employeeName,
  onReviewSubmit
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hairColorPreference, setHairColorPreference] = useState('');
  const [servicePreference, setServicePreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reviewData: ReviewData = {
        rating,
        comment: comment.trim() || undefined,
        hairColorPreference: hairColorPreference.trim() || undefined,
        servicePreference: servicePreference.trim() || undefined
      };

      await onReviewSubmit(reviewData);
      
      // Reset form
      setRating(0);
      setComment('');
      setHairColorPreference('');
      setServicePreference('');
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al enviar la reseña');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Evaluar Servicio"
      size="lg"
    >
      <div className="space-y-6">
        {/* Service Info */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">{serviceName}</h3>
          <p className="text-gray-400">con {employeeName}</p>
        </div>

        {/* Rating */}
        <div>
          <h4 className="text-md font-semibold text-white mb-3">Calificación General</h4>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-gray-400">{getRatingText(rating)}</span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-md font-semibold text-white mb-3">
            <MessageSquare className="inline-block w-4 h-4 mr-2" />
            Comentarios (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            rows={4}
          />
        </div>

        {/* Preferences */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-white">Preferencias para Futuras Visitas</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Palette className="inline-block w-4 h-4 mr-2" />
              Color de Cabello Preferido
            </label>
            <input
              type="text"
              value={hairColorPreference}
              onChange={(e) => setHairColorPreference(e.target.value)}
              placeholder="Ej: Rubio claro, castaño oscuro, etc."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Heart className="inline-block w-4 h-4 mr-2" />
              Tipo de Servicio Preferido
            </label>
            <input
              type="text"
              value={servicePreference}
              onChange={(e) => setServicePreference(e.target.value)}
              placeholder="Ej: Corte moderno, coloración, tratamientos, etc."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4" />
                <span>Enviar Reseña</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewModal;
