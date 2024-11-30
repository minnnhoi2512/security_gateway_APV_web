import React, { useEffect } from "react";
import { useGetVisitorByCredentialCardQuery } from "../services/visitor.service";
import LoadingState from "../components/State/LoadingState";

interface SearchVisitorProps {
  credentialCard: string; // Receive credential card as a prop
  onVisitorFound: (visitor: any[]) => void; // Callback to return visitor to parent
}

const SearchVisitor: React.FC<SearchVisitorProps> = ({
  credentialCard,
  onVisitorFound,
}) => {
  const {
    data: visitorData,
    isSuccess,
    isError,
  } = useGetVisitorByCredentialCardQuery({ CredentialCard: credentialCard });
 
  useEffect(() => {
    if (isSuccess && visitorData) {
      console.log(visitorData)
      onVisitorFound([visitorData]); // Trigger only when data is successfully fetched
    } else if (isError) {
      onVisitorFound([]); // Trigger callback with an empty array on error
    }
  }, [isSuccess, isError, visitorData, onVisitorFound]);
  return null; // No UI rendering, only data handling
};

export default SearchVisitor;
