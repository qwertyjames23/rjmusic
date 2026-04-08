import { Review } from '@/types';
import { StarRating } from '@/components/ui/StarRating';

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return <p className="text-muted-foreground">No reviews yet. Be the first to write one!</p>;
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border-b border-border">
          <div className="flex items-center mb-2">
            <StarRating rating={review.rating} />
            <h4 className="ml-4 font-bold">{review.title}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            by {review.user_id} on {new Date(review.created_at).toLocaleDateString()}
          </p>
          <p>{review.comment}</p>
        </div>
      ))}
    </div>
  );
}
