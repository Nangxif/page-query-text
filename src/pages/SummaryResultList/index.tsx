import { useEffect } from 'react';

const SummaryResultList = () => {
  // const { data } = useRequest(async () => {
  //   const queryParams = qs.parse(window.location.search.slice(1));
  //   const { localHref } = queryParams;
  //   const list = await pageQueryTextDataBase.getSummaryResultList(
  //     localHref as string,
  //   );
  //   return list;
  // });
  // console.log(data);
  useEffect(() => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'sendDataToSummaryResultListSidePanel') {
        console.log(request.data.summaryResultList);
      }
    });
  }, []);
  return <div></div>;
};
export default SummaryResultList;
