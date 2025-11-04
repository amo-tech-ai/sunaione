
import React from 'react';
import { Event } from '../types';
import { CalendarIcon, MapPinIcon, UsersIcon } from '../components/Icons';

interface EventsScreenProps {
    events: Event[];
    onViewDetails: (eventId: string) => void;
    onRegisterToggle: (eventId: string) => void;
}

const EventCard: React.FC<{ event: Event; onViewDetails: (id: string) => void; onRegisterToggle: (id: string) => void; }> = ({ event, onViewDetails, onRegisterToggle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col group transition-all hover:shadow-lg hover:-translate-y-1">
        <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-t-xl" />
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-start">
                <span className="text-xs font-bold px-2 py-1 rounded-full self-start bg-orange-100 text-sunai-orange">{event.category}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full self-start ${
                    event.status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                }`}>{event.status}</span>
            </div>
            <h3 className="font-bold text-lg text-sunai-dark mt-3 flex-grow">{event.title}</h3>
            <div className="text-sm text-gray-500 space-y-2 mt-3">
                <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> <span>{event.date} at {event.time}</span></div>
                <div className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> <span>{event.location} {event.isVirtual && '(Virtual)'}</span></div>
                <div className="flex items-center gap-2"><UsersIcon className="w-4 h-4" /> <span>{event.registeredCount} / {event.totalSpots} spots filled</span></div>
            </div>
            <div className="mt-6 flex items-center gap-4">
                 <button 
                    onClick={() => onViewDetails(event.id)}
                    className="flex-1 bg-white border border-gray-300 text-gray-800 font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                >
                    View Details
                </button>
                 <button 
                    onClick={() => onRegisterToggle(event.id)}
                    className={`flex-1 font-semibold py-2 rounded-lg transition-colors text-sm text-white ${
                        event.registered ? 'bg-gray-500 hover:bg-gray-600' : 'bg-sunai-orange hover:bg-opacity-90'
                    }`}
                    disabled={event.status !== 'Upcoming'}
                >
                    {event.status !== 'Upcoming' ? 'Closed' : (event.registered ? 'Unregister' : 'Register Now')}
                </button>
            </div>
        </div>
    </div>
);

const EventsScreen: React.FC<EventsScreenProps> = ({ events, onViewDetails, onRegisterToggle }) => {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-sunai-dark">Browse Events</h1>
                <p className="text-gray-600 mt-1">Discover workshops, conferences, and networking opportunities.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <EventCard 
                        key={event.id} 
                        event={event} 
                        onViewDetails={onViewDetails}
                        onRegisterToggle={onRegisterToggle}
                    />
                ))}
            </div>
        </div>
    );
};

export default EventsScreen;