import { useViewAttendees } from "../hooks/hooks";

const ViewAttendees: React.FC = () => {
  const { handleBack } = useViewAttendees();

  return (
    <div>
        asdda
        <button className="back-button" onClick={handleBack}>
        CANCEL
        </button>
    </div>
  )
}

export default ViewAttendees;