export const HtmlContent = ({ htmlString }: { htmlString: string }) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlString }}
      />
    );
  };