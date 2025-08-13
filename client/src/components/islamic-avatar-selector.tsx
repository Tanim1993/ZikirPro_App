interface IslamicAvatarSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export default function IslamicAvatarSelector({ value, onChange }: IslamicAvatarSelectorProps) {
  const avatars = [
    // Male avatars
    { id: "male-1", type: "male", color: "bg-islamic-green-light" },
    { id: "male-2", type: "male", color: "bg-islamic-green" },
    { id: "male-3", type: "male", color: "bg-blue-500" },
    { id: "male-4", type: "male", color: "bg-purple-500" },
    
    // Female avatars  
    { id: "female-1", type: "female", color: "bg-pink-400" },
    { id: "female-2", type: "female", color: "bg-purple-400" },
    { id: "female-3", type: "female", color: "bg-indigo-400" },
    { id: "female-4", type: "female", color: "bg-teal-400" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onChange(avatar.id)}
          className={`w-12 h-12 rounded-full ${avatar.color} overflow-hidden border-2 transition-all ${
            value === avatar.id
              ? 'border-islamic-green ring-2 ring-islamic-green ring-offset-2'
              : 'border-gray-300 hover:border-islamic-green'
          }`}
          data-testid={`avatar-${avatar.id}`}
        >
          <div className="w-full h-full flex items-center justify-center">
            <i className={`fas ${avatar.type === 'male' ? 'fa-user' : 'fa-user'} text-white text-lg`}></i>
          </div>
        </button>
      ))}
    </div>
  );
}
