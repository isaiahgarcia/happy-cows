import React, { useState, useEffect } from "react"
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import CommonsList from "main/components/Commons/CommonsList";
import { Container, Row, Col } from "react-bootstrap";
import { useCurrentUser } from "main/utils/currentUser";
import { useNavigate } from "react-router-dom";
import Background from './../../assets/HomePageBackground.jpg';

import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useQueryClient } from "react-query";
import { toast } from "react-toastify";

export default function HomePage() {
  const [commons, setCommons] = useState([]);
  const [commonsJoined, setCommonsJoined] = useState([]);
  const { data: currentUser } = useCurrentUser();

  const queryClient = useQueryClient();

  const { data: commonsFromBackend, error: commonsError, status: commonsStatus } =
    useBackend(
      // Stryker disable next-line all : don't test internal caching of React Query
      ["/api/commons/all"],
      {  // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
        method: "GET",
        url: "/api/commons/all"
      }
    );
  const onSuccess = (commons) => {
    // Stryker disable next-line all : hard to get variable
    var existed = new Boolean(false);
    for(let i = 0; i < commonsJoined.length; i++ ){
      if(commonsJoined[i].id == commons.id){
        existed = true;
      }
    }
    if(existed == true){
      // Stryker disable next-line all : hard to get variable
      toast(`You have already joined the common with id: ${commons.id}, name: ${commons.name}`);
    }else{
      toast(`Successfully joined the common with id: ${commons.id}, name: ${commons.name}`);
    }
  }

  const objectToAxiosParams = (newCommonsId) => ({
    url: "/api/commons/join",
    method: "POST",
    params: {
      commonsId: newCommonsId
    }
  });

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/currentUser"]
  );

  useEffect(
    () => {
      if (currentUser?.root?.user?.commons) {
        setCommonsJoined(currentUser.root.user.commons);
      }
    }, [currentUser]
  );

  useEffect(
    () => {
      if (commonsFromBackend) {
        setCommons(commonsFromBackend);
      }
    }, [commonsFromBackend]
  );

  let navigate = useNavigate();
  const visitButtonClick = (id) => { navigate("/play/" + id) };

  return (
    <div style={{ backgroundSize: 'cover', backgroundImage: `url(${Background})` }}>
      <BasicLayout>
        <h1 data-testid="homePage-title" style={{ fontSize: "75px", borderRadius: "7px", backgroundColor: "white", opacity: ".9" }} className="text-center border-0 my-3">Howdy Farmer</h1>
        <Container>
          <Row>
            <Col sm><CommonsList commonList={commonsJoined} buttonText={"Visit"} buttonLink={visitButtonClick} /></Col>
            <Col sm><CommonsList commonList={commons} buttonText={"Join"} buttonLink={mutation.mutate} /></Col>
          </Row>
        </Container>
      </BasicLayout>
    </div>
  )
}