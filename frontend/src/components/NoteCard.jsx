const NoteCard = ({ note, onClick, onDelete }) => {
  return (
    <div onClick={() => onClick(note)}>
      <h3>{note.title}</h3>
      <p>{note.content?.slice(0, 100)}</p>
      {note.isAIGenerated && <span>AI</span>}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note._id);
        }}
      >
        Delete
      </button>
    </div>
  );
};

export default NoteCard;