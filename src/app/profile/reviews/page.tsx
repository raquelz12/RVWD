import './reviews.css';
import Link from 'next/link';
import Rvw from '../../../../components/Rvw/Rvw';
import ReviewsList from './ReviewsList';
import { reviewsBy } from '../../lib/mockReviews';
import { SESSION_USERNAME } from '../../lib/publicUsers';

export default function ReviewsPage() {
    return (
        <main className="reviews-page-container">
            <h1 className="page-title reviews-page-title">Tus <Rvw>RVWS</Rvw></h1>
            <ReviewsList
                reviews={reviewsBy(SESSION_USERNAME)}
                basePath="/profile/reviews"
                own
                paginationLabel="Paginación de tus RVWs"
                empty={
                    <>
                        Aún no has escrito ninguna <Rvw>RVW</Rvw>.{' '}
                        <Link href="/feed" className="inline-link">Descubre música</Link>
                    </>
                }
            />
        </main>
    );
}
